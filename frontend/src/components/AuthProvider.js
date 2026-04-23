import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useAuthSession } from '../hooks/useAuthSession';
import { signOut } from '../services/auth.service';
import { initializeSyncManager } from '../utils/syncManager';

export function AuthProvider({ children }) {
  const authState = useAuthSession();
  const [logoutError, setLogoutError] = useState(null);

  const logout = useCallback(async () => {
    setLogoutError(null);
    try {
      await signOut();
      window.location.href = window.location.origin;
    } catch (error) {
      setLogoutError(error.message || 'Unable to sign out');
    }
  }, []);

  useEffect(() => {
    const cleanup = initializeSyncManager();
    return () => cleanup?.();
  }, []);

  const value = useMemo(
    () => ({
      ...authState,
      logout,
      logoutError,
    }),
    [authState, logout, logoutError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
