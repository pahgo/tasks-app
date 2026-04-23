import { useMemo, useState } from 'react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskFilter from './TaskFilter';
import ShareModal from './ShareModal';
import { useAuth } from '../hooks/useAuth';
import { useTaskMutations } from '../hooks/useTaskMutations';

export default function TaskList({ tasks }) {
  const { user } = useAuth();
  const { createTask: createTaskMutation, updateTask: updateTaskMutation, deleteTask: deleteTaskMutation } = useTaskMutations();
  const [filter, setFilter] = useState({ query: '', status: '', priority: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [sharingTask, setSharingTask] = useState(null);
  const [error, setError] = useState(null);
  const saving = createTaskMutation.isLoading || updateTaskMutation.isLoading || deleteTaskMutation.isLoading;

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter.status && task.status !== filter.status) {
          return false;
        }
        if (filter.priority && task.priority !== filter.priority) {
          return false;
        }
        if (filter.query) {
          const value = filter.query.toLowerCase();
          return task.title.toLowerCase().includes(value) || (task.description ?? '').toLowerCase().includes(value);
        }
        return true;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [tasks, filter]);

  const handleSave = async (data) => {
    setError(null);

    try {
      if (editingTask) {
        await updateTaskMutation.mutateAsync({ taskId: editingTask.id, updates: data });
      } else {
        await createTaskMutation.mutateAsync({ task: data, user });
      }
      setFormOpen(false);
      setEditingTask(null);
    } catch (saveError) {
      setError(saveError.message || 'Unable to save task');
    }
  };

  const handleDelete = async (taskId) => {
    setError(null);
    try {
      await deleteTaskMutation.mutateAsync(taskId);
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete task');
    }
  };

  return (
    <section className="task-list">
      <div className="task-list-header">
        <div>
          <h2>Tasks</h2>
          <p>{filteredTasks.length} tasks shown</p>
        </div>
        <button type="button" className="button button-primary" onClick={() => {
          setEditingTask(null);
          setFormOpen(true);
        }}>
          New task
        </button>
      </div>

      <TaskFilter filter={filter} onChange={setFilter} />

      {error && <div className="error-panel">{error}</div>}

      {formOpen && (
        <div className="task-form-panel">
          <TaskForm
            task={editingTask}
            onSave={handleSave}
            onCancel={() => {
              setFormOpen(false);
              setEditingTask(null);
            }}
            loading={saving}
          />
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="empty-state">No tasks found. Create your first task to begin.</div>
      ) : (
        filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onShare={(taskItem) => setSharingTask(taskItem)}
            onEdit={(taskItem) => {
              setEditingTask(taskItem);
              setFormOpen(true);
            }}
            onDelete={handleDelete}
          />
        ))
      )}

      {sharingTask && (
        <ShareModal
          task={sharingTask}
          onClose={() => setSharingTask(null)}
          onShared={() => setSharingTask(null)}
        />
      )}
    </section>
  );
}
