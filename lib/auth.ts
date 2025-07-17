import { supabase } from './supabaseClient'

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getAdminUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, username, role')
    .eq('email', email)
    .single()
  return { data, error }
} 