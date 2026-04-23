export default function TaskFilter({ filter, onChange }) {
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
    </section>
  );
}
