import { supabase } from '../config/supabase';
import { addOfflineOperation } from '../utils/offlineStore';

export async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, task_topics ( topics ( id, name ) )')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((task) => ({
    ...task,
    topics: task.task_topics?.map((topicLink) => topicLink.topics) ?? [],
  }));
}

export async function fetchTopics() {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchTaskPermissions() {
  const { data, error } = await supabase
    .from('task_permissions')
    .select('*')
    .order('shared_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createTask(task, user) {
  const payload = {
    title: task.title,
    description: task.description ?? null,
    priority: task.priority ?? 'medium',
    status: task.status ?? 'todo',
    created_by: user.id,
  };

  if (!navigator.onLine) {
    addOfflineOperation({ type: 'create_task', payload });
    return { offline: true };
  }

  const { data, error } = await supabase.from('tasks').insert(payload).select().single();

  if (error) {
    if (!navigator.onLine) {
      addOfflineOperation({ type: 'create_task', payload });
      return { offline: true };
    }
    throw new Error(error.message);
  }

  return data;
}

export async function updateTask(taskId, updates) {
  const payload = {
    ...updates,
  };

  if (!navigator.onLine) {
    addOfflineOperation({ type: 'update_task', payload: { taskId, updates: payload } });
    return { offline: true };
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    if (!navigator.onLine) {
      addOfflineOperation({ type: 'update_task', payload: { taskId, updates: payload } });
      return { offline: true };
    }
    throw new Error(error.message);
  }

  return data;
}

export async function deleteTask(taskId) {
  if (!navigator.onLine) {
    addOfflineOperation({ type: 'delete_task', payload: { taskId } });
    return { offline: true };
  }

  const { data, error } = await supabase.from('tasks').delete().eq('id', taskId).select().single();

  if (error) {
    if (!navigator.onLine) {
      addOfflineOperation({ type: 'delete_task', payload: { taskId } });
      return { offline: true };
    }
    throw new Error(error.message);
  }

  return data;
}

export async function shareTask(taskId, userId, role = 'viewer') {
  const payload = {
    task_id: taskId,
    user_id: userId,
    role,
  };

  if (!navigator.onLine) {
    addOfflineOperation({ type: 'share_task', payload });
    return { offline: true };
  }

  const { data, error } = await supabase.from('task_permissions').insert(payload).select().single();

  if (error) {
    if (!navigator.onLine) {
      addOfflineOperation({ type: 'share_task', payload });
      return { offline: true };
    }
    throw new Error(error.message);
  }

  return data;
}
