// Rich Menu Configuration for LINE Bot

export interface RichMenu {
  size: {
    width: number
    height: number
  }
  selected: boolean
  name: string
  chatBarText: string
  areas: RichMenuArea[]
}

export interface RichMenuArea {
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  action: RichMenuAction
}

export type RichMenuAction =
  | { type: "uri"; uri: string; label?: string }
  | { type: "message"; text: string; label?: string }
  | { type: "postback"; data: string; displayText?: string; label?: string }

// Rich Menu สำหรับเกษตรกร
export const FARMER_RICH_MENU: RichMenu = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "เมนูสำหรับเกษตรกร",
  chatBarText: "เมนูบริการ",
  areas: [
    // แถวบน - ซ้าย: จองบริการโดรน
    {
      bounds: { x: 0, y: 0, width: 833, height: 843 },
      action: {
        type: "uri",
        label: "จองพ่นยาโดรน",
        uri: `${process.env.NEXT_PUBLIC_BASE_URL}/line/liff/booking`,
      },
    },
    // แถวบน - กลาง: เช่าเครื่องจักร
    {
      bounds: { x: 833, y: 0, width: 834, height: 843 },
      action: {
        type: "message",
        label: "เช่าเครื่องจักร",
        text: "เช่าเครื่องจักร",
      },
    },
    // แถวบน - ขวา: ดูประวัติ
    {
      bounds: { x: 1667, y: 0, width: 833, height: 843 },
      action: {
        type: "uri",
        label: "ประวัติการจอง",
        uri: `${process.env.NEXT_PUBLIC_BASE_URL}/line/liff/my-bookings`,
      },
    },
    // แถวล่าง - ซ้าย: ดูราคา
    {
      bounds: { x: 0, y: 843, width: 833, height: 843 },
      action: {
        type: "message",
        label: "ดูราคา",
        text: "ราคา",
      },
    },
    // แถวล่าง - กลาง: ถามคำถาม AI
    {
      bounds: { x: 833, y: 843, width: 834, height: 843 },
      action: {
        type: "message",
        label: "ถามคำถาม",
        text: "สอบถามข้อมูล",
      },
    },
    // แถวล่าง - ขวา: ติดต่อเจ้าหน้าที่
    {
      bounds: { x: 1667, y: 843, width: 833, height: 843 },
      action: {
        type: "message",
        label: "ติดต่อเจ้าหน้าที่",
        text: "ต้องการความช่วยเหลือ",
      },
    },
  ],
}

// Rich Menu สำหรับ Provider (เจ้าของรถ/เครื่องจักร)
export const PROVIDER_RICH_MENU: RichMenu = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "เมนูสำหรับ Provider",
  chatBarText: "เมนู Provider",
  areas: [
    // แถวบน - ซ้าย: ดูคำขอเช่า
    {
      bounds: { x: 0, y: 0, width: 833, height: 843 },
      action: {
        type: "message",
        label: "คำขอเช่า",
        text: "ดูคำขอเช่าเครื่องจักร",
      },
    },
    // แถวบน - กลาง: จัดการเครื่องจักร
    {
      bounds: { x: 833, y: 0, width: 834, height: 843 },
      action: {
        type: "uri",
        label: "จัดการเครื่องจักร",
        uri: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/equipment`,
      },
    },
    // แถวบน - ขวา: สถานะการเช่า
    {
      bounds: { x: 1667, y: 0, width: 833, height: 843 },
      action: {
        type: "message",
        label: "สถานะการเช่า",
        text: "สถานะการเช่าปัจจุบัน",
      },
    },
    // แถวล่าง - ซ้าย: รายงานรายได้
    {
      bounds: { x: 0, y: 843, width: 833, height: 843 },
      action: {
        type: "message",
        label: "รายงานรายได้",
        text: "ดูรายงานรายได้",
      },
    },
    // แถวล่าง - กลาง: แจ้งปัญหา
    {
      bounds: { x: 833, y: 843, width: 834, height: 843 },
      action: {
        type: "message",
        label: "แจ้งปัญหา",
        text: "แจ้งปัญหาเครื่องจักร",
      },
    },
    // แถวล่าง - ขวา: ช่วยเหลือ
    {
      bounds: { x: 1667, y: 843, width: 833, height: 843 },
      action: {
        type: "message",
        label: "ช่วยเหลือ",
        text: "ช่วยเหลือ Provider",
      },
    },
  ],
}

// สร้าง Rich Menu
export async function createRichMenu(
  richMenu: RichMenu,
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch("https://api.line.me/v2/bot/richmenu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(richMenu),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Failed to create rich menu:", error)
      return null
    }

    const data = await response.json()
    return data.richMenuId
  } catch (error) {
    console.error("Error creating rich menu:", error)
    return null
  }
}

// Upload รูปภาพ Rich Menu
export async function uploadRichMenuImage(
  richMenuId: string,
  imageBuffer: Buffer,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`,
      {
        method: "POST",
        headers: {
          "Content-Type": "image/png",
          Authorization: `Bearer ${accessToken}`,
        },
        body: imageBuffer,
      }
    )

    return response.ok
  } catch (error) {
    console.error("Error uploading rich menu image:", error)
    return false
  }
}

// กำหนด Rich Menu เป็นค่าเริ่มต้น
export async function setDefaultRichMenu(
  richMenuId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return response.ok
  } catch (error) {
    console.error("Error setting default rich menu:", error)
    return false
  }
}

// ผูก Rich Menu กับผู้ใช้เฉพาะคน
export async function linkRichMenuToUser(
  userId: string,
  richMenuId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return response.ok
  } catch (error) {
    console.error("Error linking rich menu to user:", error)
    return false
  }
}

// ดึงรายการ Rich Menu ทั้งหมด
export async function getRichMenuList(accessToken: string): Promise<any[]> {
  try {
    const response = await fetch("https://api.line.me/v2/bot/richmenu/list", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) return []

    const data = await response.json()
    return data.richmenus || []
  } catch (error) {
    console.error("Error getting rich menu list:", error)
    return []
  }
}

// ลบ Rich Menu
export async function deleteRichMenu(
  richMenuId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.line.me/v2/bot/richmenu/${richMenuId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return response.ok
  } catch (error) {
    console.error("Error deleting rich menu:", error)
    return false
  }
}
