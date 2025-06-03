import React, { useEffect, useState } from "react";
import axios from "axios";
import './goal.css';
const BASE_URL = 'https://personfiy.onrender.com';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const fetchGoals = async () => {
    const res = await axios.get(`${BASE_URL}/goal`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setGoals(res.data);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const addGoal = async () => {
    await axios.post(
      `${BASE_URL}/goal`,
      { title, targetAmount: parseFloat(amount) },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    setTitle("");
    setAmount("");
    fetchGoals();
  };

  const deleteGoal = async (id) => {
    await axios.delete(`${BASE_URL}/goal/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    fetchGoals();
  };

  const addMoneyToGoal = async (id, amount) => {
    await axios.patch(
      `${BASE_URL}/goal/${id}/add-money`,
      { amount: parseFloat(amount) },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    fetchGoals();
  };

  return (
    <div className="goals-container" style={{ padding: "2rem", maxWidth: "700px", margin: "auto" }}>
      <h2>🎯 Your Goals</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Goal Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Target Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={addGoal}>Add Goal</button>
      </div>

      <ul>
        {goals.map((goal) => (
          <li
            key={goal._id}
            style={{
              marginBottom: "1.5rem",
              border: "1px solid #ddd",
              padding: "1rem",
              borderRadius: "8px",
            }}
          >
            <strong>{goal.title}</strong> — ₹{goal.currentAmount} / ₹{goal.targetAmount}

            {goal.achieved && (
              <span style={{ color: "green", marginLeft: "10px" }}>✅ Achieved</span>
            )}

            {!goal.achieved && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const addAmount = formData.get("amount");
                  addMoneyToGoal(goal._id, addAmount);
                  e.target.reset();
                }}
                style={{ display: "flex", gap: "10px", marginTop: "10px" }}
              >
                <input
                  type="number"
                  name="amount"
                  placeholder="Add ₹"
                  min="1"
                  required
                  style={{ width: "100px" }}
                />
                <button type="submit">Add</button>
              </form>
            )}

            <button
              onClick={() => deleteGoal(goal._id)}
              style={{ marginTop: "10px", color: "red" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Goals;
