import { useMemo, useState } from 'react';
import TaskTable from './TaskTable';
import TaskForm from './TaskForm';
import TaskFilter from './TaskFilter';
import { useAuth } from '../hooks/useAuth';
import { useTaskMutations } from '../hooks/useTaskMutations';
import { useTopics } from '../hooks/useTopics';
import { setTaskTopics } from '../services/topics.service';

export default function TaskList({ tasks }) {
  const { user } = useAuth();
  const { createTask: createTaskMutation, updateTask: updateTaskMutation, deleteTask: deleteTaskMutation } = useTaskMutations();
  const { topics } = useTopics();
  const [filter, setFilter] = useState({ query: '', status: '', priority: '', topics: [] });
  const [editingTask, setEditingTask] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState(null);
  const saving = createTaskMutation.isLoading || updateTaskMutation.isLoading || deleteTaskMutation.isLoading;

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Hide archived tasks unless explicitly filtered
        if (!filter.status && task.status === 'archived') {
          return false;
        }

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

        // Filter by topics if selected
        if (filter.topics && filter.topics.length > 0) {
          const taskTopicIds = task.topics?.map((t) => t.id) ?? [];
          return filter.topics.some((topicId) => taskTopicIds.includes(topicId));
        }

        return true;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [tasks, filter]);

  const handleSave = async (data) => {
    setError(null);

    try {
      if (editingTask) {
        const { topicIds, ...updates } = data;
        await updateTaskMutation.mutateAsync({ taskId: editingTask.id, updates });
        
        // Handle topic updates
        if (topicIds) {
          await setTaskTopics(editingTask.id, topicIds);
        }
      } else {
        const { topicIds, ...taskData } = data;
        const createdTask = await createTaskMutation.mutateAsync({ task: taskData, user });
        
        // Handle topic assignments for new task
        if (topicIds && topicIds.length > 0) {
          await setTaskTopics(createdTask.id, topicIds);
        }
      }
      setFormOpen(false);
      setEditingTask(null);
    } catch (saveError) {
      setError(saveError.message || 'Unable to save task');
    }
  };

  const handleInlineUpdate = async (data) => {
    setError(null);
    try {
      await updateTaskMutation.mutateAsync(data);
    } catch (updateError) {
      setError(updateError.message || 'Unable to update task');
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
          + New task
        </button>
      </div>

      <TaskFilter filter={filter} onChange={setFilter} topics={topics} />

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
        <TaskTable
          tasks={filteredTasks}
          onUpdateTask={handleInlineUpdate}
          onDeleteTask={handleDelete}
          onEdit={(taskItem) => {
            setEditingTask(taskItem);
            setFormOpen(true);
          }}
          loading={saving}
        />
      )}
    </section>
  );
}
