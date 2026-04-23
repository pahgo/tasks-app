import { useState } from 'react';

const statusLabels = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
  archived: 'Archived',
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const priorityColors = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

export default function TaskTable({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onEdit,
  loading,
}) {
  const [editingCell, setEditingCell] = useState(null);
  const [tempValue, setTempValue] = useState('');

  const handleCellClick = (taskId, field, currentValue) => {
    setEditingCell({ taskId, field });
    setTempValue(currentValue);
  };

  const handleCellChange = (taskId, field, value) => {
    setTempValue(value);
  };

  const handleCellSave = async (task, field, newValue) => {
    if (newValue !== task[field]) {
      await onUpdateTask({
        taskId: task.id,
        updates: { [field]: newValue },
      });
    }
    setEditingCell(null);
  };

  const handleCellBlur = (task, field) => {
    handleCellSave(task, field, tempValue);
  };

  const handleKeyDown = (e, task, field) => {
    if (e.key === 'Enter') {
      handleCellSave(task, field, tempValue);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  return (
    <div className="task-table-wrapper">
      <table className="task-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Topics</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="task-row">
              <td className="task-title-cell">
                <span className="task-title">{task.title}</span>
              </td>

              <td className="task-description-cell">
                <span className="task-description">
                  {task.description || <span className="empty-text">—</span>}
                </span>
              </td>

              {/* Priority - Inline Editable */}
              <td
                className="task-priority-cell"
                style={{
                  borderLeftColor: priorityColors[task.priority],
                }}
              >
                {editingCell?.taskId === task.id && editingCell?.field === 'priority' ? (
                  <select
                    className="inline-select"
                    value={tempValue}
                    onChange={(e) => handleCellChange(task.id, 'priority', e.target.value)}
                    onBlur={() => handleCellBlur(task, 'priority')}
                    onKeyDown={(e) => handleKeyDown(e, task, 'priority')}
                    autoFocus
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (
                  <button
                    className="task-cell-button"
                    onClick={() => handleCellClick(task.id, 'priority', task.priority)}
                    title="Click to edit"
                  >
                    <span className="priority-badge">{priorityLabels[task.priority]}</span>
                  </button>
                )}
              </td>

              {/* Status - Inline Editable */}
              <td className="task-status-cell">
                {editingCell?.taskId === task.id && editingCell?.field === 'status' ? (
                  <select
                    className="inline-select"
                    value={tempValue}
                    onChange={(e) => handleCellChange(task.id, 'status', e.target.value)}
                    onBlur={() => handleCellBlur(task, 'status')}
                    onKeyDown={(e) => handleKeyDown(e, task, 'status')}
                    autoFocus
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                    <option value="archived">Archived</option>
                  </select>
                ) : (
                  <button
                    className="task-cell-button"
                    onClick={() => handleCellClick(task.id, 'status', task.status)}
                    title="Click to edit"
                  >
                    <span className={`status-badge status-${task.status}`}>
                      {statusLabels[task.status]}
                    </span>
                  </button>
                )}
              </td>

              <td className="task-topics-cell">
                <span className="task-topics">
                  {task.topics && task.topics.length > 0 ? (
                    task.topics.map((topic) => (
                      <span key={topic.id} className="topic-tag">
                        {topic.name}
                      </span>
                    ))
                  ) : (
                    <span className="empty-text">—</span>
                  )}
                </span>
              </td>

              <td className="task-actions-cell">
                <div className="task-actions">
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => onEdit(task)}
                    title="Edit full task"
                    disabled={loading}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="action-button action-delete"
                    onClick={() => {
                      if (window.confirm(`Delete "${task.title}"?`)) {
                        onDeleteTask(task.id);
                      }
                    }}
                    title="Delete task"
                    disabled={loading}
                  >
                    ✕
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
