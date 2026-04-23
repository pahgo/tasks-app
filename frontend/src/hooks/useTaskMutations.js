import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, updateTask, deleteTask } from '../services/tasks.service';

export function useTaskMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ task, user }) => createTask(task, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, updates }) => updateTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    createTask: createMutation,
    updateTask: updateMutation,
    deleteTask: deleteMutation,
  };
}
