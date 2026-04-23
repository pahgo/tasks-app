import { useEffect, useState } from 'react';
import { useTopics } from '../hooks/useTopics';

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
  const [selectedTopics, setSelectedTopics] = useState(task?.topics?.map((t) => t.id) ?? []);
  const [newTopicInput, setNewTopicInput] = useState('');
  const { topics, createTopic, isCreating } = useTopics();

  useEffect(() => {
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
    setPriority(task?.priority ?? 'medium');
    setStatus(task?.status ?? 'todo');
    setSelectedTopics(task?.topics?.map((t) => t.id) ?? []);
  }, [task]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      topicIds: selectedTopics,
    });
  };

  const handleAddNewTopic = async () => {
    if (newTopicInput.trim()) {
      try {
        const created = await createTopic(newTopicInput);
        setSelectedTopics([...selectedTopics, created.id]);
        setNewTopicInput('');
      } catch (error) {
        console.error('Failed to create topic:', error);
      }
    }
  };

  const toggleTopic = (topicId) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
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

      {/* Topics Section */}
      <div className="task-form-row">
        <label>Topics</label>
        {topics.length > 0 && (
          <div className="topic-selector">
            {topics.map((topic) => (
              <label key={topic.id} className="topic-checkbox">
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(topic.id)}
                  onChange={() => toggleTopic(topic.id)}
                />
                <span>{topic.name}</span>
              </label>
            ))}
          </div>
        )}
        <div className="topic-input-group">
          <input
            type="text"
            className="task-input"
            placeholder="Add new topic..."
            value={newTopicInput}
            onChange={(e) => setNewTopicInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddNewTopic();
              }
            }}
          />
          <button
            type="button"
            className="button button-secondary"
            onClick={handleAddNewTopic}
            disabled={!newTopicInput.trim() || isCreating}
          >
            {isCreating ? 'Adding…' : 'Add'}
          </button>
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
