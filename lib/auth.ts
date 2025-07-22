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

// ฟังก์ชันใหม่: ล็อคอินและดึงข้อมูล admin ในคราวเดียว
export async function signInWithEmailAndGetAdminData(email: string, password: string) {
  try {
    console.log('[auth.ts] signInWithEmailAndGetAdminData started for email:', email)
    
    // Step 1: ล็อคอิน
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    console.log('[auth.ts] Auth result:', { authData: !!authData, authError: !!authError })
    
    if (authError) {
      console.log('[auth.ts] Auth error:', authError)
      return { data: null, error: authError, adminData: null }
    }
    
    // Step 2: ดึงข้อมูล admin ทันที (ถ้าล็อคอินสำเร็จ)
    console.log('[auth.ts] Fetching admin data...')
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email, username, role')
      .eq('email', email)
      .single()
    
    console.log('[auth.ts] Admin data result:', { adminData: !!adminData, adminError: !!adminError })
    
    // Return ข้อมูลทั้งหมด (ไม่ throw error ถ้าไม่มีข้อมูล admin)
    const result = { 
      data: authData, 
      error: null, 
      adminData: adminData || null,
      adminError: adminError
    }
    
    console.log('[auth.ts] Final result:', { 
      hasData: !!result.data, 
      hasAdminData: !!result.adminData,
      adminRole: result.adminData?.role
    })
    
    return result
    
  } catch (error) {
    console.log('[auth.ts] Catch error:', error)
    return { data: null, error: error as any, adminData: null }
  }
}