import { getOfflineQueue, clearOfflineQueue } from './offlineStore';
import { createTask, updateTask, deleteTask, shareTask } from '../services/tasks.service';

export async function processOfflineQueue() {
  const queue = getOfflineQueue();
  if (!queue.length) {
    return { processed: 0 };
  }

  let processed = 0;

  for (const item of queue) {
    try {
      if (item.type === 'create_task') {
        await createTask(item.payload, { id: item.payload.created_by });
      } else if (item.type === 'update_task') {
        await updateTask(item.payload.taskId, item.payload.updates);
      } else if (item.type === 'delete_task') {
        await deleteTask(item.payload.taskId);
      } else if (item.type === 'share_task') {
        await shareTask(item.payload.task_id, item.payload.user_id, item.payload.role);
      }
      processed += 1;
    } catch (error) {
      console.error('Offline sync failed for item', item, error);
      return { processed, error };
    }
  }

  clearOfflineQueue();
  return { processed };
}

export function initializeSyncManager() {
  const sync = async () => {
    if (!navigator.onLine) {
      return;
    }
    await processOfflineQueue();
  };

  window.addEventListener('online', sync);

  return () => {
    window.removeEventListener('online', sync);
  };
}
