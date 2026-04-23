import React from 'react';

const priorityStyles = {
  low: { backgroundColor: '#d4edda', color: '#155724' },
  medium: { backgroundColor: '#fff3cd', color: '#856404' },
  high: { backgroundColor: '#f8d7da', color: '#721c24' },
};

const statusLabels = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
  archived: 'Archived',
};

export default function TaskCard({ task, onEdit, onDelete, onShare }) {
  return (
    <article
      style={{
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '1rem',
        marginBottom: '1rem',
        backgroundColor: '#fff',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem' }}>{task.title}</h2>
          <p style={{ margin: 0, color: '#555' }}>{task.description ?? 'No description yet.'}</p>
        </div>
        <div style={{ display: 'grid', gap: '0.5rem', textAlign: 'right' }}>
          <span style={{ padding: '0.35rem 0.65rem', borderRadius: '999px', fontWeight: 600, ...priorityStyles[task.priority] }}>
            {task.priority}
          </span>
          <span style={{ color: '#444', fontSize: '0.9rem' }}>{statusLabels[task.status] ?? task.status}</span>
        </div>
      </header>

      <section style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <small style={{ color: '#777' }}>{new Date(task.created_at).toLocaleString()}</small>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => onShare(task)}
            style={{ display: 'none', padding: '0.5rem 0.85rem', cursor: 'pointer', backgroundColor: '#e8f0fe', border: '1px solid #c6dafc' }}
          >
            Share
          </button>
          <button
            type="button"
            onClick={() => onEdit(task)}
            style={{ padding: '0.5rem 0.85rem', cursor: 'pointer', backgroundColor: '#f5f7ff', border: '1px solid #d7e0fc', borderRadius: '999px' }}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            style={{ padding: '0.5rem 0.85rem', cursor: 'pointer', backgroundColor: '#fff5f5', border: '1px solid #f5c2c7', borderRadius: '999px' }}
          >
            Delete
          </button>
        </div>
      </section>
    </article>
  );
}
