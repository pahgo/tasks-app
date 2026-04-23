import { useEffect, useState } from 'react';

const statusOptions = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
  { value: 'archived', label: 'Archived' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function TaskForm({ task, onSave, onCancel, loading }) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState(task?.priority ?? 'medium');
  const [status, setStatus] = useState(task?.status ?? 'todo');

  useEffect(() => {
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
    setPriority(task?.priority ?? 'medium');
    setStatus(task?.status ?? 'todo');
  }, [task]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="task-form-row">
        <label>Title</label>
        <input
          className="task-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>
      <div className="task-form-row">
        <label>Description</label>
        <textarea
          className="task-textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
        />
      </div>
      <div className="task-form-row task-form-grid">
        <div>
          <label>Priority</label>
          <select
            className="task-select"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Status</label>
          <select
            className="task-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="task-form-actions">
        <button type="button" className="button button-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? 'Saving…' : task ? 'Update task' : 'Create task'}
        </button>
      </div>
    </form>
  );
}
