import { useAuth } from '../hooks/useAuth';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useTasks } from '../hooks/useTasks';
import TaskList from './TaskList';

export default function MainApp() {
  const { user, logout, logoutError } = useAuth();
  const online = useOnlineStatus();
  const { data: tasks, isLoading, isError, error } = useTasks();
  const displayName = user?.user_metadata?.full_name || user?.email || 'Welcome';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="main-app">
      <header className="page-header">
        <div>
          <p className="eyebrow">Task manager</p>
          <h1>Tasks App</h1>
          <p className="hero-copy">Stay organized with smart task creation, real-time sync, and a clean workspace.</p>
        </div>

        <div className="header-panel">
          <div className="user-card">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="avatar" />
            ) : (
              <div className="avatar avatar-fallback">{initials}</div>
            )}
            <div>
              <p className="user-name">{displayName}</p>
              <span className={`status-badge ${online ? 'online' : 'offline'}`}>{online ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          <button type="button" className="button button-secondary" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="content-panel">
        {isLoading ? (
          <div className="loading-panel">Loading tasks…</div>
        ) : isError ? (
          <div className="error-panel">Unable to load tasks: {error?.message}</div>
        ) : (
          <TaskList tasks={tasks ?? []} />
        )}

        {logoutError && <div className="error-panel">{logoutError}</div>}
      </main>
    </div>
  );
}
