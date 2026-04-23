import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserTopics, createTopic } from '../services/topics.service';
import { useAuth } from './useAuth';

export function useTopics() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['topics', user?.id],
    queryFn: () => fetchUserTopics(user?.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (topicName) => createTopic(user?.id, topicName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics', user?.id] });
    },
  });

  return {
    topics: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createTopic: createMutation.mutateAsync,
    isCreating: createMutation.isLoading,
  };
}
