// src/components/Layout.js
// src/components/Layout.js
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './layout.css'; // You can put styles here or use inline styles

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };


  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Personify</h2>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/transactions_page">Transactions</Link></li>
          <li><Link to="/reports">Reports</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
          <li><Link to="/bills">Bills</Link></li>
          <li><Link to="/goals">Goals</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
