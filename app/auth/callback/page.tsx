import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import AuthCallbackClient from "./AuthCallbackClient"

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              กำลังเข้าสู่ระบบ...
            </h2>
            <p className="text-gray-600">
              กรุณารอสักครู่ระหว่างที่เราตรวจสอบข้อมูลของคุณ
            </p>
          </div>
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  )
}
