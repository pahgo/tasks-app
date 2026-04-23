import { supabase } from '../config/supabase';

export async function fetchUserTopics(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('topics')
    .select('id, name, created_at')
    .eq('created_by', userId)
    .order('name');

  if (error) {
    console.error('Error fetching topics:', error);
    return [];
  }

  return data || [];
}

export async function createTopic(userId, name) {
  if (!userId || !name?.trim()) return null;

  const { data, error } = await supabase
    .from('topics')
    .insert([{ name: name.trim(), created_by: userId }])
    .select('id, name')
    .single();

  if (error) {
    console.error('Error creating topic:', error);
    throw error;
  }

  return data;
}

export async function fetchTaskTopics(taskId) {
  if (!taskId) return [];

  const { data, error } = await supabase
    .from('task_topics')
    .select('topic_id, topics(id, name)')
    .eq('task_id', taskId);

  if (error) {
    console.error('Error fetching task topics:', error);
    return [];
  }

  return data?.map((tt) => tt.topics) || [];
}

export async function setTaskTopics(taskId, topicIds = []) {
  if (!taskId) return;

  // Delete existing topic associations
  const { error: deleteError } = await supabase
    .from('task_topics')
    .delete()
    .eq('task_id', taskId);

  if (deleteError) {
    console.error('Error deleting task topics:', deleteError);
    throw deleteError;
  }

  // Add new topic associations
  if (topicIds.length > 0) {
    const { error: insertError } = await supabase
      .from('task_topics')
      .insert(topicIds.map((topicId) => ({ task_id: taskId, topic_id: topicId })));

    if (insertError) {
      console.error('Error adding task topics:', insertError);
      throw insertError;
    }
  }
}
