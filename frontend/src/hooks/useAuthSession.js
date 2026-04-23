import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { createUserProfileIfMissing } from '../services/auth.service';

let sessionInitialized = false;
let sessionInitPromise = null;

export function useAuthSession() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      if (sessionInitPromise) {
        try {
          const result = await sessionInitPromise;
          if (isMounted) {
            setSession(result.session);
            setUser(result.user);
            setError(result.error);
            setLoading(false);
          }
          return;
        } catch (err) {
          console.error('Error awaiting session init:', err);
        }
      }

      if (sessionInitialized && !sessionInitPromise) {
        setLoading(false);
        return;
      }

      sessionInitPromise = (async () => {
        let currentSession = null;
        let sessionError = null;

        try {
          const { data, error } = await supabase.auth.getSessionFromUrl();
          if (error && !/No auth(entication)? URL found/i.test(error.message)) {
            sessionError = error;
          }
          currentSession = data?.session ?? null;
        } catch (urlError) {
          console.error('Error parsing auth callback URL', urlError);
        }

        if (!currentSession) {
          try {
            const { data, error } = await supabase.auth.getSession();
            currentSession = data?.session ?? null;
            if (error) {
              sessionError = error;
            }
          } catch (getSessionError) {
            console.error('Error getting stored session:', getSessionError);
            sessionError = getSessionError;
          }
        }

        const currentUser = currentSession?.user ?? null;

        if (currentUser) {
          try {
            await createUserProfileIfMissing(currentUser);
          } catch (serviceError) {
            console.error('Failed to create profile after session restore', serviceError);
          }
        }

        sessionInitialized = true;
        return { session: currentSession, user: currentUser, error: sessionError };
      })();

      try {
        const result = await sessionInitPromise;
        if (isMounted) {
          setSession(result.session);
          setUser(result.user);
          setError(result.error);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
        sessionInitPromise = null;
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) {
        return;
      }

      const currentSession = session ?? null;
      const currentUser = currentSession?.user ?? null;

      setSession(currentSession);
      setUser(currentUser);
      setLoading(false);

      if (event === 'SIGNED_IN' && currentUser) {
        try {
          await createUserProfileIfMissing(currentUser);
        } catch (serviceError) {
          console.error('Failed to create profile after sign in', serviceError);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    loading,
    error,
  };
}
