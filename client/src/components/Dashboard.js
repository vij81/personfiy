// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import AddTransaction from '../components/AddTransaction';
// import CSVTools from '../components/CSVTools';
// import './Dashboard.css';

// function Dashboard() {
//     const [data, setData] = useState({
//         income: 0,
//         expenses: 0,
//         recentTransactions: []
//     });

//     const fetchDashboard = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             const res = await axios.get('http://localhost:8080/api/dashboard/', {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setData(res.data);
//         } catch (err) {
//             console.error('Error fetching dashboard:', err);
//         }
//     };

//     useEffect(() => {
//         fetchDashboard();
//     }, []);

//     const handleAddTransaction = (newTx) => {
//         setData(prev => {
//             const updatedIncome = newTx.type === 'income' ? prev.income + newTx.amount : prev.income;
//             const updatedExpenses = newTx.type === 'expense' ? prev.expenses + newTx.amount : prev.expenses;
//             return {
//                 ...prev,
//                 income: updatedIncome,
//                 expenses: updatedExpenses,
//                 recentTransactions: [newTx, ...prev.recentTransactions.slice(0, 4)]
//             };
//         });
//     };

//     const totalBalance = data.income - data.expenses;

//     return (
//         <div className="dashboard-container">
//             {/* Header */}
//             <header className="dashboard-header">
//                 <h2>Personal Finance Dashboard</h2>
//                 <nav>
//                     <ul>
//                         <li><a href="transactions.html">💰 Transactions</a></li>
//                         <li><a href="reports.html">📊 Reports</a></li>
//                         <li><a href="budgets.html">📋 Budgets</a></li>
//                         <li><a href="goals.html">🔔 Goals</a></li>
//                         <li href='/settings'>Settings</li>
//                         <li><button onClick={() => {
//                             localStorage.removeItem('token');
//                             window.location.href = '/';
//                         }}>Logout</button></li>
//                     </ul>
//                 </nav>
//             </header>

//             {/* Summary Cards */}
//             <div className="summary-cards">
//                 <div className="card income">Income: ₹{data.income}</div>
//                 <div className="card expense">Expense: ₹{data.expenses}</div>
//                 <div className="card balance">Balance: ₹{totalBalance}</div>
//             </div>

//             {/* Add Transaction */}
//             <AddTransaction onAdd={handleAddTransaction} />

//             {/* CSV Export & Import */}
//             <CSVTools onImportSuccess={fetchDashboard} />

//             {/* Recent Transactions */}
//             <div className="transactions-section">
//                 <h3>Recent Transactions</h3>
//                 <ul>
//                     {data.recentTransactions.length === 0 ? (
//                         <li>No transactions yet.</li>
//                     ) : (
//                         data.recentTransactions.map(tx => (
//                             <li key={tx._id || tx.date + tx.amount}>
//                                 <strong>{tx.type}</strong>: ₹{tx.amount} – {tx.category} on {new Date(tx.date).toLocaleDateString()}
//                             </li>
//                         ))
//                     )}
//                 </ul>
//             </div>
//         </div>
//     );
// }

// export default Dashboard;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Link, useNavigate } from 'react-router-dom';
// import './Dashboard.css';

// const BASE_URL = 'http://localhost:8080';

// const Dashboard = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [form, setForm] = useState({ type: 'expense', category: '', amount: '', date: '', description: '' });
//   const [csvFile, setCsvFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [token, setToken] = useState(localStorage.getItem('token'));

//   const navigate = useNavigate();

//   // ✅ Capture token from URL (for Google OAuth)
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const tokenFromUrl = params.get('token');
//     if (tokenFromUrl) {
//       localStorage.setItem('token', tokenFromUrl);
//       setToken(tokenFromUrl);
//       window.history.replaceState({}, document.title, '/dashboard'); // Clean URL
//     }
//   }, []);

//   // ✅ Protect route if not logged in
//   useEffect(() => {
//     if (!token) {
//       navigate('/');
//     } else {
//       fetchTransactions();
//     }
//   }, [token]);

//   const fetchTransactions = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await axios.get(`${BASE_URL}/transactions`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setTransactions(res.data);
//     } catch (err) {
//       setError('Failed to load transactions');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFormChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.category || !form.amount || !form.date || isNaN(parseFloat(form.amount))) {
//       return alert('Please fill in all fields correctly.');
//     }

//     try {
//       await axios.post(`${BASE_URL}/transactions`, {
//         ...form,
//         amount: parseFloat(form.amount),
//       }, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       fetchTransactions();
//       setForm({ type: 'expense', category: '', amount: '', date: '', description: '' });
//     } catch (err) {
//       alert('Failed to add transaction.');
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     setToken(null);
//     navigate('/');
//   };

//   const handleCsvChange = (e) => setCsvFile(e.target.files[0]);

//   const handleCsvUpload = async () => {
//     if (!csvFile) return;
//     const formData = new FormData();
//     formData.append('file', csvFile);

//     try {
//       await axios.post(`${BASE_URL}/transactions/import`, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       fetchTransactions();
//     } catch (err) {
//       alert('CSV import failed');
//     }
//   };

//   const handleExport = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}/transactions/export`, {
//         headers: { Authorization: `Bearer ${token}` },
//         responseType: 'blob',
//       });
//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', 'transactions.csv');
//       document.body.appendChild(link);
//       link.click();
//     } catch (err) {
//       alert('CSV export failed');
//     }
//   };

//   const formatDate = (str) => new Date(str).toLocaleDateString();

//   const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
//   const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
//   const balance = income - expense;

//   return (
//     <div>
      
//       <div className="main-content">
//         <div className="summary-boxes">
//           <div className="summary-box income">Income: ₹{income}</div>
//           <div className="summary-box expense">Expense: ₹{expense}</div>
//           <div className="summary-box balance">Balance: ₹{balance}</div>
//   </div>

//       {loading && <p>Loading...</p>}
//       {error && <p style={{ color: 'red' }}>{error}</p>}

//       <form onSubmit={handleFormSubmit}>
//         <select name="type" value={form.type} onChange={handleFormChange}>
//           <option value="income">Income</option>
//           <option value="expense">Expense</option>
//         </select>
//         <input name="category" placeholder="Category" value={form.category} onChange={handleFormChange} required />
//         <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleFormChange} required />
//         <input name="date" type="date" value={form.date} onChange={handleFormChange} required />
//         <button type="submit">Add</button>
//       </form>

//       <input type="file" accept=".csv" onChange={handleCsvChange} />
//       <button onClick={handleCsvUpload}>Import CSV</button>
//       <button onClick={handleExport}>Export CSV</button>

//       <table>
//         <thead>
//           <tr><th>Type</th><th>Category</th><th>Amount</th><th>Date</th></tr>
//         </thead>
//         <tbody>
//           {transactions.map(t => (
//             <tr key={t._id}>
//               <td>{t.type}</td>
//               <td>{t.category}</td>
//               <td>₹{t.amount}</td>
//               <td>{formatDate(t.date)}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



import { useEffect, useState,useCallback  } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const BASE_URL = 'https://personfiy.onrender.com';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ type: 'expense', category: '', amount: '', date: '', description: '' });
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [filter, setFilter] = useState('newest'); // NEW: Filter state

  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      setToken(tokenFromUrl);
      window.history.replaceState({}, document.title, '/dashboard');
    }
  }, []);

  
  const fetchTransactions = useCallback(async () => {
  setLoading(true);
  setError('');
  try {
    const res = await axios.get(`${BASE_URL}/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTransactions(res.data);
  } catch (err) {
    setError('Failed to load transactions');
  } finally {
    setLoading(false);
  }
}, [token]);


  useEffect(() => {
  if (!token) {
    navigate('/');
  } else {
    fetchTransactions();
  }
}, [token, navigate, fetchTransactions]);


  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount || !form.date || isNaN(parseFloat(form.amount))) {
      return alert('Please fill in all fields correctly.');
    }

    try {
      await axios.post(`${BASE_URL}/transactions`, {
        ...form,
        amount: parseFloat(form.amount),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTransactions();
      setForm({ type: 'expense', category: '', amount: '', date: '', description: '' });
    } catch (err) {
      alert('Failed to add transaction.');
    }
  };

  const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this transaction?')) return;
  try {
    await axios.delete(`${BASE_URL}/transactions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTransactions();  // refresh the list after deletion
  } catch (err) {
    alert('Failed to delete transaction');
  }
};
  const handleCsvChange = (e) => setCsvFile(e.target.files[0]);

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      await axios.post(`${BASE_URL}/transactions/import`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchTransactions();
    } catch (err) {
      alert('CSV import failed');
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/transactions/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('CSV export failed');
    }
  };

  const formatDate = (str) => new Date(str).toLocaleDateString();

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  // ✅ Filtered + sliced transactions
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
  const displayedTransactions = filter === 'newest'
    ? sortedTransactions.slice(0, 5)
    : sortedTransactions.reverse().slice(0, 5);

  return (
    <div>
      <div className="main-content">
        <div className="summary-boxes">
          <div className="summary-box income">Income: ₹{income}</div>
          <div className="summary-box expense">Expense: ₹{expense}</div>
          <div className="summary-box balance">Balance: ₹{balance}</div>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleFormSubmit} className="transaction-form">
          <select name="type" value={form.type} onChange={handleFormChange}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input name="category" placeholder="Category" value={form.category} onChange={handleFormChange} required />
          <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleFormChange} required />
          <input name="date" type="date" value={form.date} onChange={handleFormChange} required />
          <button type="submit">Add</button>
        </form>

        <input type="file" accept=".csv" onChange={handleCsvChange} />
        <button onClick={handleCsvUpload}>Import CSV</button>
        <button onClick={handleExport}>Export CSV</button>

        {/* ✅ Filter Buttons */}
        <div style={{ marginTop: '20px' }}>
  <label htmlFor="filter">Filter Transactions: </label>
  <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
    <option value="newest">Newest 5</option>
    <option value="oldest">Oldest 5</option>
  </select>
</div>


        {/* ✅ Display Filtered Transactions */}
        <table>
          <thead>
            <tr><th>Type</th><th>Category</th><th>Amount</th><th>Date</th></tr>
          </thead>
          <tbody>
            {displayedTransactions.map(t => (
              <tr key={t._id}>
                <td>{t.type}</td>
                <td>{t.category}</td>
                <td>₹{t.amount}</td>
                <td>{formatDate(t.date)}</td>
                <td>
        <button onClick={() => handleDelete(t._id)}>Delete</button>
      </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
