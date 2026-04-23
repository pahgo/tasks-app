import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import Header from './Header';
import TaskList from './TaskList';

export default function MainApp() {
  const { user, logout, logoutError } = useAuth();
  const { data: tasks, isLoading, isError, error } = useTasks();

  return (
    <div className="main-app">
      <Header user={user} onLogout={logout} logoutError={logoutError} />

      <main className="content-panel">
        {isLoading ? (
          <div className="loading-panel">Loading tasks…</div>
        ) : isError ? (
          <div className="error-panel">Unable to load tasks: {error?.message}</div>
        ) : (
          <TaskList tasks={tasks ?? []} />
        )}
      </main>
    </div>
  );
}
