import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { createUserProfileIfMissing } from '../services/auth.service';

export function useAuthSession() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      setLoading(true);

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
        const { data, error } = await supabase.auth.getSession();
        currentSession = data?.session ?? null;
        if (error) {
          sessionError = error;
        }
      }

      if (!isMounted) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
      }

      const currentUser = currentSession?.user ?? null;
      setSession(currentSession);
      setUser(currentUser);

      if (currentUser) {
        try {
          await createUserProfileIfMissing(currentUser);
        } catch (serviceError) {
          console.error('Failed to create profile after session restore', serviceError);
        }
      }

      setLoading(false);
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
