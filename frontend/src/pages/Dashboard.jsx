import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiFilter,
  FiCheckSquare,
  FiClock,
  FiAlertTriangle,
  FiTrendingUp,
} from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      params.limit = 50;

      const res = await API.get('/tasks', { params });
      setTasks(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (data) => {
    try {
      await API.post('/tasks', data);
      toast.success('Task created!');
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (data) => {
    try {
      await API.put(`/tasks/${editingTask._id}`, data);
      toast.success('Task updated!');
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await API.delete(`/tasks/${id}`);
      toast.success('Task deleted!');
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete task');
    }
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    highPriority: tasks.filter((t) => t.priority === 'high').length,
  };

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header animate-fade-in-up">
          <div>
            <h1>
              {isAdmin ? 'All Tasks' : 'My Tasks'}
            </h1>
            <p className="subtitle">
              Welcome back, <strong>{user?.name}</strong>
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <FiPlus size={16} />
            New Task
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card">
            <div className="stat-icon total">
              <FiCheckSquare />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <FiClock />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon progress">
              <FiTrendingUp />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.inProgress}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed">
              <FiCheckSquare />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon high">
              <FiAlertTriangle />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.highPriority}</span>
              <span className="stat-label">High Priority</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="filter-group">
            <FiFilter size={14} />
            <select
              className="form-select filter-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select
              className="form-select filter-select"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state animate-fade-in">
            <div className="icon">📋</div>
            <h3>No tasks yet</h3>
            <p>Create your first task to get started</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <FiPlus size={16} />
              Create Task
            </button>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task, index) => (
              <div
                key={task._id}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <TaskCard
                  task={task}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                  showOwner={isAdmin}
                />
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {showForm && (
          <TaskForm
            onSubmit={handleCreateTask}
            onClose={() => setShowForm(false)}
          />
        )}
        {editingTask && (
          <TaskForm
            task={editingTask}
            onSubmit={handleUpdateTask}
            onClose={() => setEditingTask(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
