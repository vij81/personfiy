import { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css'
const BASE_URL = 'https://personfiy.onrender.com';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [form, setForm] = useState({ type: 'expense', category: '', amount: '', date: '', description: '' });
  const [filter, setFilter] = useState({ type: 'all', day: '', month: '', year: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;
  const token = localStorage.getItem('token');

  // Fetch all transactions
  const fetchTransactions = useCallback(async () => {
  try {
    const res = await axios.get(`${BASE_URL}/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sortedTransactions = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(sortedTransactions);
    setFiltered(sortedTransactions);
  } catch (err) {
    alert('Failed to load transactions');
  }
}, [token]); // ✅ token is the only external dependency


  // Handle add transaction
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
      setForm({ type: 'expense', category: '', amount: '', date: '', description: '' });
      fetchTransactions();
      setCurrentPage(1);
    } catch (err) {
      alert('Failed to add transaction.');
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };
  const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this transaction?')) return;
  try {
    await axios.delete(`${BASE_URL}/transactions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTransactions();
  } catch (err) {
    alert('Failed to delete transaction');
  }
};
  const applyFilter = () => {
    let filteredList = [...transactions];

    if (filter.type !== 'all') {
      filteredList = filteredList.filter(t => t.type === filter.type);
    }

    if (filter.day) {
      filteredList = filteredList.filter(t => new Date(t.date).getDate() === parseInt(filter.day));
    }

    if (filter.month) {
      filteredList = filteredList.filter(t => new Date(t.date).getMonth() + 1 === parseInt(filter.month));
    }

    if (filter.year) {
      filteredList = filteredList.filter(t => new Date(t.date).getFullYear() === parseInt(filter.year));
    }

    setFiltered(filteredList);
    setCurrentPage(1);
  };

  useEffect(() => {
  fetchTransactions();
}, [fetchTransactions]); // ✅ Fix: Add fetchTransactions here


  const formatDate = (str) => new Date(str).toLocaleDateString();

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filtered.slice(indexOfFirstTransaction, indexOfLastTransaction);

  return (
    <div>
      <h2>Transactions</h2>

      {/* Add Transaction */}
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

      {/* Filters */}
      <div>
        <select name="type" value={filter.type} onChange={handleFilterChange}>
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input name="day" type="number" placeholder="Day" onChange={handleFilterChange} />
        <input name="month" type="number" placeholder="Month (1-12)" onChange={handleFilterChange} />
        <input name="year" type="number" placeholder="Year" onChange={handleFilterChange} />
        <button onClick={applyFilter}>Apply Filter</button>
      </div>

      {/* Transactions Table */}
      <table border="1">
        <thead>
          <tr>
            <th>Type</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {currentTransactions.map(t => (
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

      <div className='pagination'>
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
        <span >Page {currentPage} of {Math.ceil(filtered.length / transactionsPerPage)}</span>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === Math.ceil(filtered.length / transactionsPerPage)}>Next</button>
      </div>
    </div>
  );
};

export default Transactions;