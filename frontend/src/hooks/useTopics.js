import { useQuery } from '@tanstack/react-query';
import { fetchTopics } from '../services/tasks.service';

export function useTopics() {
  return useQuery({
    queryKey: ['topics'],
    queryFn: fetchTopics,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });
}
