import { supabase } from '../config/supabase';

export async function fetchProfileByEmail(email) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .limit(1)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
