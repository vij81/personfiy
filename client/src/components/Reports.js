import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './Reports.css';
import {
  Bar,
  Pie,
  Line
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend
);

const BASE_URL = 'https://personfiy.onrender.com';

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const token = localStorage.getItem('token');

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data);
    } catch (err) {
      alert('Failed to fetch transactions');
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Apply filters
  const getFilteredTransactions = () => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      return (
        (!month || parseInt(month) === m) &&
        (!year || parseInt(year) === y)
      );
    });
  };

  const filtered = getFilteredTransactions();

  // Prepare data for charts
  const incomeTotal = filtered
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expenseTotal = filtered
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const barChartData = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        label: 'Amount',
        data: [incomeTotal, expenseTotal],
        backgroundColor: ['#4CAF50', '#F44336'],
      },
    ],
  };

  const expenseCategories = {};
  filtered
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
    });

  const pieChartData = {
    labels: Object.keys(expenseCategories),
    datasets: [
      {
        label: 'Expenses by Category',
        data: Object.values(expenseCategories),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#8BC34A',
          '#9C27B0',
          '#FF9800',
          '#00BCD4',
        ],
      },
    ],
  };

  // Prepare Line Chart Data
  const incomeByDate = {};
  const expenseByDate = {};

  filtered.forEach((t) => {
    const date = new Date(t.date).toISOString().split('T')[0]; // YYYY-MM-DD
    if (t.type === 'income') {
      incomeByDate[date] = (incomeByDate[date] || 0) + t.amount;
    } else if (t.type === 'expense') {
      expenseByDate[date] = (expenseByDate[date] || 0) + t.amount;
    }
  });

  const allDates = Array.from(
    new Set([...Object.keys(incomeByDate), ...Object.keys(expenseByDate)])
  ).sort();

  const lineChartData = {
    labels: allDates,
    datasets: [
      {
        label: 'Income',
        data: allDates.map((date) => incomeByDate[date] || 0),
        borderColor: '#4CAF50',
        backgroundColor: '#4CAF50',
        fill: false,
        tension: 0.2,
      },
      {
        label: 'Expense',
        data: allDates.map((date) => expenseByDate[date] || 0),
        borderColor: '#F44336',
        backgroundColor: '#F44336',
        fill: false,
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="reports-container">
      <h2>Financial Reports</h2>

      {/* Filters */}
      <div className="report-filters">
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">All Months</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Year (e.g. 2025)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Income vs Expense Bar Chart */}
        <div className="chart-container">
          <h3>Income vs Expense</h3>
          <Bar data={barChartData} />
        </div>

        {/* Expense Breakdown Pie Chart */}
        <div className="chart-container">
          <h3>Expense Breakdown</h3>
          {Object.keys(expenseCategories).length > 0 ? (
            <Pie data={pieChartData} />
          ) : (
            <p className="no-data-message">No expense data for selected filters.</p>
          )}
        </div>
      </div>

      {/* Line Chart */}
      <div className="chart-container">
        <h3>Income & Expense Over Time</h3>
        {allDates.length > 0 ? (
          <Line data={lineChartData} />
        ) : (
          <p className="no-data-message">No transaction data to display line chart.</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
