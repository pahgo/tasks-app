import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { fetchTasks } from '../services/tasks.service';
import { useAuth } from './useAuth';

export function useTasks() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: fetchTasks,
    staleTime: 10000,
    refetchOnWindowFocus: false,
    enabled: !!user?.id && !authLoading,
  });

  useEffect(() => {
    const tasksChannel = supabase
      .channel('public:tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      )
      .subscribe();

    const permissionsChannel = supabase
      .channel('public:task_permissions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_permissions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      )
      .subscribe();

    return () => {
      tasksChannel.unsubscribe();
      permissionsChannel.unsubscribe();
    };
  }, [queryClient]);

  return query;
}
