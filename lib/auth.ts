import { createClient } from './supabaseBrowser'

// Create a shared client instance for auth operations
const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // Server-side: import server client
    const { supabase } = require('./supabaseClient')
    return supabase
  }
  // Client-side: use browser client
  return createClient()
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getAdminUserByEmail(email: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, username, role')
    .eq('email', email)
    .single()
  return { data, error }
}

// ฟังก์ชันใหม่: ล็อคอินและดึงข้อมูล admin ในคราวเดียว
export async function signInWithEmailAndGetAdminData(email: string, password: string) {
  try {
    const supabase = getSupabaseClient()

    // Step 1: ล็อคอิน
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return { data: null, error: authError, adminData: null }
    }

    // Step 2: ดึงข้อมูล admin ทันที (ถ้าล็อคอินสำเร็จ)
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email, username, role')
      .eq('email', email)
      .single()

    // Return ข้อมูลทั้งหมด (ไม่ throw error ถ้าไม่มีข้อมูล admin)
    return {
      data: authData,
      error: null,
      adminData: adminData || null,
      adminError: adminError
    }

  } catch (error) {
    return { data: null, error: error as any, adminData: null }
  }
}