import { useEffect, useState } from 'react';
import axios from 'axios';
import './Settings.css';
const Settings = () => {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [editing, setEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('https://personfiy.onrender.com/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile({ name: res.data.name, email: res.data.email });
      } catch (err) {
        setMessage('Failed to load profile.');
      }
    };
    fetchProfile();
  }, [token]);

  const handleProfileUpdate = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    await axios.put(
  'https://personfiy.onrender.com/users/update-profile',
  { name: profile.name, email: profile.email },
  { headers: { Authorization: `Bearer ${token}` } }
);

    alert('Profile updated!');
    setEditing(false);
  } catch (err) {
    console.error(err);
    alert('Failed to update profile');
  }
};
  const handlePasswordChange = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    const res = await axios.put(
      'https://personfiy.onrender.com/users/change-password',
      {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert(res.data.msg);
    setPasswordData({ currentPassword: '', newPassword: '' });
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert(err.response?.data?.msg || 'Failed to change password');
  }
};


  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await axios.delete('https://personfiy.onrender.com/users/delete', {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      window.location.href = 'https://personfiy.netlify.app/'; // Redirect to login
    } catch (err) {
      setMessage('Failed to delete account.');
    }
  };
return (
  <div className="settings-container">
    <h2>Account Settings</h2>
    {message && <p style={{ color: 'green' }}>{message}</p>}

    {/* Profile Form */}
    <form onSubmit={handleProfileUpdate} className="settings-form">
      <h3>Edit Profile</h3>
      <div className="form-row">
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            disabled={!editing}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            disabled={!editing}
            required
          />
        </div>
      </div>

      {editing ? (
        <button type="submit">Save Changes</button>
      ) : (
        <button type="button" onClick={() => setEditing(true)}>
          Edit Profile
        </button>
      )}
    </form>

    {/* Password Form */}
    <form onSubmit={handlePasswordChange} className="settings-form">
      <h3>Change Password</h3>
      <div className="form-row">
        <div>
          <label>Current Password:</label>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            required
          />
        </div>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            required
          />
        </div>
      </div>
      <button type="submit">Change Password</button>
    </form>


    <button onClick={handleDeleteAccount} className="delete-button">
      Delete Account
    </button>
  </div>
);
};

export default Settings;
