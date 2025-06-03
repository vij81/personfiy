import React, { useEffect, useState } from "react";
import axios from "axios";
import './notifications.css';
const BASE_URL = "https://personfiy.onrender.com";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    const res = await axios.get(`${BASE_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setNotifications(res.data);
  };

  const deleteNotification = async (id) => {
    await axios.delete(`${BASE_URL}/notifications/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
  <div className="notifications-container">
    <h2>🔔 Notifications</h2>

    {notifications.length === 0 ? (
      <p>No notifications yet.</p>
    ) : (
      <ul className="notifications-list">
        {notifications.map((note) => (
          <li key={note._id}>
            <p>{note.message}</p>
            <small>{new Date(note.timestamp).toLocaleString()}</small>
            <br />
            <button onClick={() => deleteNotification(note._id)}>Delete</button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

};

export default Notifications;
