const OFFLINE_QUEUE_KEY = 'tasks-app-offline-queue';

export function getOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addOfflineOperation(operation) {
  const queue = getOfflineQueue();
  queue.push({
    ...operation,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue() {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

export function hasOfflineWork() {
  return getOfflineQueue().length > 0;
}
