import { useQuery } from '@tanstack/react-query';
import { fetchTaskPermissions } from '../services/tasks.service';

export function useTaskSharing() {
  return useQuery({
    queryKey: ['task_permissions'],
    queryFn: fetchTaskPermissions,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });
}
