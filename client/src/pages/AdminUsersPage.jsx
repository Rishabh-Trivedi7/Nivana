import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getUsers, updateUserRole, deleteUser } from '../services/adminService.js';
import Loader from '../components/common/Loader.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import './AdminUsersPage.css';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUsersList = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.users);
    } catch (err) {
      setError(err.message || 'Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change ${targetUser.fullName}'s role to "${newRole}"?`)) {
      return;
    }
    setActionLoadingId(targetUser._id);
    setError('');
    try {
      await updateUserRole(targetUser._id, newRole);
      await fetchUsersList();
    } catch (err) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? This cannot be undone.')) {
      return;
    }
    setActionLoadingId(userId);
    setError('');
    try {
      await deleteUser(userId);
      await fetchUsersList();
    } catch (err) {
      setError(err.message || 'Failed to delete user account');
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return <Loader message="Retrieving user database..." />;
  }

  return (
    <div className="admin-users">
      <h1 className="admin-users__title">User Management</h1>

      <ErrorMessage message={error} />

      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Date Joined</th>
              <th>System Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u._id === currentUser?._id;

              return (
                <tr key={u._id}>
                  <td style={{ fontWeight: 500 }}>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <span className={`user-role-badge user-role-badge--${u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <div className="user-actions">
                      <button
                        className="user-action-btn user-action-btn--role"
                        onClick={() => handleToggleRole(u)}
                        disabled={isSelf || actionLoadingId !== null}
                        title={isSelf ? 'You cannot demote yourself' : `Change role to ${u.role === 'admin' ? 'user' : 'admin'}`}
                      >
                        Toggle Role
                      </button>
                      <button
                        className="user-action-btn user-action-btn--delete"
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={isSelf || actionLoadingId !== null}
                        title={isSelf ? 'You cannot delete yourself' : 'Delete user account'}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
