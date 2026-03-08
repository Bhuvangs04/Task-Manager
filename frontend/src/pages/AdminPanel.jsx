import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
  FiUsers,
  FiTrash2,
  FiShield,
  FiUser,
  FiMail,
  FiCalendar,
} from 'react-icons/fi';
import './AdminPanel.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users', { params: { limit: 50 } });
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and all their tasks?`)) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await API.put(`/admin/users/${id}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update role');
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="admin-panel">
      <div className="container">
        <div className="admin-header animate-fade-in-up">
          <div>
            <h1>
              <FiShield className="header-icon" />
              Admin Panel
            </h1>
            <p className="subtitle">Manage users and roles</p>
          </div>
          <div className="admin-stat">
            <FiUsers />
            <span>{users.length} Users</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading users...</span>
          </div>
        ) : (
          <div className="users-table-wrapper animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="user-name-cell">{u.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="email-cell">
                        <FiMail size={12} />
                        {u.email}
                      </span>
                    </td>
                    <td>
                      <select
                        className="role-select"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className="date-cell">
                        <FiCalendar size={12} />
                        {formatDate(u.createdAt)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteUser(u._id, u.name)}
                      >
                        <FiTrash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
