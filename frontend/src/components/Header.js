import { useState, useRef, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function Header({ user, onLogout, logoutError }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const online = useOnlineStatus();
  
  const displayName = user?.user_metadata?.full_name || user?.email || 'Welcome';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout();
  };

  return (
    <header className="sticky-header">
      <div className="header-content">
        <div className="header-branding">
          <h1>Tasks</h1>
        </div>

        <div className="header-user" ref={dropdownRef}>
          <button
            className="user-avatar-button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="User menu"
            title={displayName}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="header-avatar" />
            ) : (
              <div className="header-avatar avatar-fallback">{initials}</div>
            )}
            <div className="header-user-info">
              <span className="header-user-name">{displayName}</span>
              <span className={`header-status-badge ${online ? 'online' : 'offline'}`}>
                {online ? 'Online' : 'Offline'}
              </span>
            </div>
          </button>

          {dropdownOpen && (
            <div className="user-dropdown">
              <button
                type="button"
                className="dropdown-item dropdown-signout"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {logoutError && <div className="header-error">{logoutError}</div>}
    </header>
  );
}
