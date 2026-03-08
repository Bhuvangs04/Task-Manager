import { FiEdit2, FiTrash2, FiCalendar, FiUser } from 'react-icons/fi';
import './TaskCard.css';

const TaskCard = ({ task, onEdit, onDelete, showOwner = false }) => {
  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className={`task-card ${isOverdue ? 'overdue' : ''}`}>
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-actions">
          <button className="btn-icon" onClick={() => onEdit(task)} title="Edit">
            <FiEdit2 size={14} />
          </button>
          <button
            className="btn-icon danger"
            onClick={() => onDelete(task._id)}
            title="Delete"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <div className="task-badges">
          <span className={`badge badge-${task.status}`}>
            {task.status}
          </span>
          <span className={`badge badge-${task.priority}`}>
            {task.priority}
          </span>
        </div>

        <div className="task-info">
          {task.dueDate && (
            <span className={`task-date ${isOverdue ? 'overdue-text' : ''}`}>
              <FiCalendar size={12} />
              {formatDate(task.dueDate)}
            </span>
          )}
          {showOwner && task.createdBy?.name && (
            <span className="task-owner">
              <FiUser size={12} />
              {task.createdBy.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
