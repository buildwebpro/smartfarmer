import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseClient"
import { verifyAdminAuth, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบสิทธิ์ admin
    const user = await verifyAdminAuth(request)
    if (!user) {
      return forbiddenResponse("Admin access required")
    }

    // ตรวจสอบว่ามี supabaseAdmin หรือไม่
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: "Service temporarily unavailable"
      }, { status: 503 })
    }

    // ดึงข้อมูลผู้ใช้จากตาราง auth.users และ admin_users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error("Error fetching auth users:", authError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // ดึงข้อมูลเพิ่มเติมจาก admin_users table
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("*")

    if (adminError) {
      console.error("Error fetching admin users:", adminError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // รวมข้อมูลจาก auth.users และ admin_users
    const users = authUsers.users.map(authUser => {
      const adminUser = adminUsers?.find(admin => admin.user_id === authUser.id)
      return {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || adminUser?.full_name || '',
        role: adminUser?.role || 'user',
        is_active: !(authUser as any).banned_until,
        created_at: authUser.created_at,
        last_login: authUser.last_sign_in_at
      }
    })

    return NextResponse.json({ data: users })
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบสิทธิ์ admin
    const user = await verifyAdminAuth(request)
    if (!user) {
      return forbiddenResponse("Admin access required")
    }

    // ตรวจสอบว่ามี supabaseAdmin หรือไม่
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: "Service temporarily unavailable"
      }, { status: 503 })
    }

    const body = await request.json()
    const { email, full_name, password, role = 'user', is_active = true } = body

    if (!email || !full_name || !password) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 })
    }

    // สร้างผู้ใช้ใหม่ใน auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name
      },
      email_confirm: true
    })

    if (authError) {
      console.error("Error creating auth user:", authError)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // ถ้าเป็น admin ให้เพิ่มข้อมูลใน admin_users table
    if (role === 'admin') {
      const { error: adminError } = await supabaseAdmin
        .from("admin_users")
        .insert([{
          user_id: authUser.user.id,
          username: email, // ใช้ email เป็น username
          email,
          full_name,
          role: 'admin'
        }])

      if (adminError) {
        console.error("Error creating admin user:", adminError)
        // ลบผู้ใช้จาก auth ถ้าไม่สามารถสร้าง admin record ได้
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
        return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
      }
    }

    // ปิดการใช้งานถ้าต้องการ
    if (!is_active) {
      const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
        authUser.user.id,
        { ban_duration: '876000h' } // ban for 100 years
      )
      
      if (banError) {
        console.error("Error banning user:", banError)
      }
    }

    return NextResponse.json({ 
      data: {
        id: authUser.user.id,
        email,
        full_name,
        role,
        is_active
      }
    })
  } catch (error) {
    console.error("Error in POST /api/admin/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // ตรวจสอบสิทธิ์ admin
    const user = await verifyAdminAuth(request)
    if (!user) {
      return forbiddenResponse("Admin access required")
    }

    // ตรวจสอบว่ามี supabaseAdmin หรือไม่
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: "Service temporarily unavailable"
      }, { status: 503 })
    }

    const body = await request.json()
    const { id, email, full_name, role, is_active } = body

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID ผู้ใช้" }, { status: 400 })
    }

    // อัพเดต auth.users
    const updateData: any = {}
    if (email) updateData.email = email
    if (full_name) updateData.user_metadata = { full_name }

    if (Object.keys(updateData).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, updateData)
      
      if (authError) {
        console.error("Error updating auth user:", authError)
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
      }
    }

    // จัดการสถานะ active/inactive
    if (typeof is_active === 'boolean') {
      if (is_active) {
        // ยกเลิกการ ban
        const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(id, {
          ban_duration: 'none'
        })
        if (unbanError) {
          console.error("Error unbanning user:", unbanError)
        }
      } else {
        // ban ผู้ใช้
        const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(id, {
          ban_duration: '876000h'
        })
        if (banError) {
          console.error("Error banning user:", banError)
        }
      }
    }

    // จัดการ role
    if (role) {
      // ตรวจสอบว่ามีข้อมูลใน admin_users หรือไม่
      const { data: existingAdmin } = await supabaseAdmin
        .from("admin_users")
        .select("*")
        .eq("user_id", id)
        .single()

      if (role === 'admin') {
        if (!existingAdmin) {
          // สร้าง admin record ใหม่
          const { error: adminError } = await supabaseAdmin
            .from("admin_users")
            .insert([{
              user_id: id,
              username: email, // ใช้ email เป็น username
              email,
              full_name,
              role: 'admin'
            }])

          if (adminError) {
            console.error("Error creating admin user:", adminError)
            return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
          }
        } else {
          // อัพเดต admin record ที่มีอยู่
          const { error: adminError } = await supabaseAdmin
            .from("admin_users")
            .update({
              username: email, // ใช้ email เป็น username
              email,
              full_name,
              role: 'admin'
            })
            .eq("user_id", id)

          if (adminError) {
            console.error("Error updating admin user:", adminError)
            return NextResponse.json({ error: "Failed to update admin user" }, { status: 500 })
          }
        }
      } else if (role === 'user' && existingAdmin) {
        // ลบ admin record ถ้าเปลี่ยนเป็น user
        const { error: deleteError } = await supabaseAdmin
          .from("admin_users")
          .delete()
          .eq("user_id", id)

        if (deleteError) {
          console.error("Error deleting admin user:", deleteError)
          return NextResponse.json({ error: "Failed to delete admin user" }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PUT /api/admin/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // ตรวจสอบสิทธิ์ admin
    const user = await verifyAdminAuth(request)
    if (!user) {
      return forbiddenResponse("Admin access required")
    }

    // ตรวจสอบว่ามี supabaseAdmin หรือไม่
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: "Service temporarily unavailable"
      }, { status: 503 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID ผู้ใช้" }, { status: 400 })
    }

    // ลบจาก admin_users ก่อน (ถ้ามี)
    const { error: adminError } = await supabaseAdmin
      .from("admin_users")
      .delete()
      .eq("user_id", id)

    if (adminError) {
      console.error("Error deleting admin user:", adminError)
      // ไม่ return error เพราะอาจจะไม่มีข้อมูลใน admin_users
    }

    // ลบจาก auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (authError) {
      console.error("Error deleting auth user:", authError)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/admin/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
