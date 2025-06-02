// const express = require('express');
// const router = express.Router();
// const auth = require('../middleware/auth');
// const Transaction = require('../models/Transaction');
// const csv = require('csv-parser');
// const { Parser } = require('json2csv');
// const multer = require('multer');
// const fs = require('fs');
// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(403).json({ msg: 'No token, authorization denied' });
//   }

//   const token = authHeader.split(' ')[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
//     req.user = decoded; // Attach user info to request
//     next();
//   } catch (err) {
//     return res.status(403).json({ msg: 'Token is not valid' });
//   }
// };

// // Get transactions
// router.get('/transactions', authMiddleware, async (req, res) => {
//   const userId = req.user.id;
//   const transactions = await Transaction.find({ user: userId });
//   res.json(transactions);
// });

// // Add transaction
// router.post('/transactions', authMiddleware, async (req, res) => {
//   const { category, amount, type, date, description } = req.body;
// const tx = new Transaction({ category, amount, type, date, description, userId: req.user.id });

//   await tx.save();
//   res.status(201).json(tx);
// });

// // Delete transaction
// router.delete('/transactions/:id', authMiddleware, async (req, res) => {
//   const { id } = req.params;
//   await Transaction.deleteOne({ _id: id, userId: req.user.id });
//   res.json({ message: 'Transaction deleted' });
// });

// // CSV Upload (optional)
// const upload = multer({ dest: 'uploads/' });

// router.post('/import-csv', authMiddleware, upload.single('file'), (req, res) => {
//   const results = [];
//   fs.createReadStream(req.file.path)
//     .pipe(csv())
//     .on('data', (data) => {
//       results.push({
//         category: data.category,
//         amount: parseFloat(data.amount),
//         type: data.type,
//         date: new Date(data.date),
//         userId: req.user.id
//       });
//     })
//     .on('end', async () => {
//       await Transaction.insertMany(results);
//       fs.unlinkSync(req.file.path);
//       res.status(200).json({ message: 'CSV Imported' });
//     });
// });
// // CSV Export Route
// router.get('/export', authMiddleware, async (req, res) => {
//   try {
//     const transactions = await Transaction.find({ userId: req.user.id });

//     if (!transactions.length) {
//       return res.status(404).json({ message: 'No transactions to export' });
//     }

//     const fields = ['date', 'type', 'category', 'amount', 'description'];
//     const opts = { fields };
//     const parser = new Parser(opts);
//     const csv = parser.parse(transactions);

//     res.header('Content-Type', 'text/csv');
//     res.attachment('transactions.csv');
//     return res.send(csv);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error exporting transactions' });
//   }
// });
// module.exports = router;


const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');
const csv = require('csv-parser');
const fs = require('fs');
const multer = require('multer');
const { Parser } = require('json2csv');

const upload = multer({ dest: 'uploads/' });

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, category, amount, date, description } = req.body;
    const tx = new Transaction({
      type, category, amount, date, description, userId: req.user.id
    });
    await tx.save();
    res.status(201).json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/import', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file.mimetype.includes('csv')) {
    return res.status(400).json({ message: 'Only CSV files allowed' });
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push({
      ...data,
      userId: req.user.id,
      amount: parseFloat(data.amount),
      date: new Date(data.date),
    }))
    .on('end', async () => {
      try {
        await Transaction.insertMany(results);
        res.status(200).json({ message: 'CSV imported' });
      } catch (err) {
        res.status(500).json({ message: 'Import failed' });
      } finally {
        fs.unlinkSync(req.file.path);
      }
    });
});

router.get('/export', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).lean();
    const fields = ['type', 'category', 'amount', 'date', 'description'];
    const parser = new Parser({ fields });
    const csv = parser.parse(transactions);
    res.header('Content-Type', 'text/csv');
    res.attachment('transactions.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Export failed' });
  }
});
// Delete transaction by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, userId: req.user.id });
    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    await tx.deleteOne();
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


module.exports = router;
