export default function TaskFilter({ filter, onChange, topics = [] }) {
  const toggleTopic = (topicId) => {
    const currentTopics = filter.topics || [];
    onChange({
      ...filter,
      topics: currentTopics.includes(topicId)
        ? currentTopics.filter((t) => t !== topicId)
        : [...currentTopics, topicId],
    });
  };

  return (
    <section className="task-filter">
      <input
        value={filter.query}
        onChange={(event) => onChange({ ...filter, query: event.target.value })}
        placeholder="Search tasks"
        className="task-input"
      />
      <div className="filter-controls">
        <select
          value={filter.status}
          onChange={(event) => onChange({ ...filter, status: event.target.value })}
          className="task-select"
        >
          <option value="">All statuses</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={filter.priority}
          onChange={(event) => onChange({ ...filter, priority: event.target.value })}
          className="task-select"
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {topics.length > 0 && (
        <div className="filter-topics">
          <div className="filter-topics-header">
            <label>Filter by topic:</label>
          </div>
          <div className="filter-topics-list">
            {topics.map((topic) => (
              <label key={topic.id} className="topic-filter-checkbox">
                <input
                  type="checkbox"
                  checked={(filter.topics || []).includes(topic.id)}
                  onChange={() => toggleTopic(topic.id)}
                />
                <span className="topic-filter-label">{topic.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
