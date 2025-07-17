import { type NextRequest, NextResponse } from "next/server"

// Mock user database
const users = [
  {
    id: "1",
    username: "admin",
    password: "admin123", // In production, use hashed passwords
    name: "ผู้ดูแลระบบ",
    role: "admin",
  },
  {
    id: "2",
    username: "operator",
    password: "op123",
    name: "พนักงานปฏิบัติการ",
    role: "operator",
  },
  {
    id: "3",
    username: "pilot1",
    password: "pilot123",
    name: "นายสมศักดิ์ บินเก่ง",
    role: "pilot",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Find user
    const user = users.find((u) => u.username === username && u.password === password)

    if (!user) {
      return NextResponse.json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 })
    }

    // Generate mock JWT token (in production, use proper JWT)
    const token = `mock_token_${user.id}_${Date.now()}`

    // Return user data (exclude password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 })
  }
}
