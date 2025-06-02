import React, { useEffect, useState } from "react";
import axios from "axios";
import './bills.css';
const BASE_URL = "http://localhost:8080";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchBills = async () => {
    const res = await axios.get(`${BASE_URL}/bills`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setBills(res.data);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const addBill = async () => {
    await axios.post(
      `${BASE_URL}/bills`,
      { title, amount, dueDate },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    setTitle("");
    setAmount("");
    setDueDate("");
    fetchBills();
  };

  const deleteBill = async (id) => {
    await axios.delete(`${BASE_URL}/bills/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    fetchBills();
  };

  const markPaid = async (id) => {
    await axios.patch(`${BASE_URL}/bills/${id}/mark-paid`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    fetchBills();
  };

  return (
  <div className="bills-container">
    <h2>🧾 Upcoming Bills</h2>

    <div className="bills-form">
      <input type="text" placeholder="Bill Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <button onClick={addBill}>Add Bill</button>
    </div>

    <ul className="bills-list">
      {bills.map((bill) => (
        <li key={bill._id}>
          <strong>{bill.title}</strong>
          <div className="bill-meta">₹{bill.amount} — Due: {new Date(bill.dueDate).toLocaleDateString()}</div>
          <div className="bill-actions">
            {bill.paid ? (
              <span style={{ color: "green" }}>Paid ✅</span>
            ) : (
              <button className="mark-paid" onClick={() => markPaid(bill._id)}>
                Mark as Paid
              </button>
            )}
            <button className="delete" onClick={() => deleteBill(bill._id)}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

};

export default Bills;
