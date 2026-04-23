import { supabase } from '../config/supabase';

export async function createUserProfileIfMissing(user) {
  if (!user || !user.id) {
    return null;
  }

  const profile = {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  };

  const { error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' });

  if (error) {
    throw error;
  }

  return profile;
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
