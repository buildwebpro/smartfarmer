import { NextRequest, NextResponse } from "next/server"
import {
  FARMER_RICH_MENU,
  PROVIDER_RICH_MENU,
  createRichMenu,
  setDefaultRichMenu,
  linkRichMenuToUser,
  getRichMenuList,
  deleteRichMenu,
} from "@/lib/line/richmenu"

// สร้าง Rich Menu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, menuType } = body

    const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json(
        { error: "LINE_CHANNEL_ACCESS_TOKEN not configured" },
        { status: 500 }
      )
    }

    switch (action) {
      case "create":
        const menu = menuType === "provider" ? PROVIDER_RICH_MENU : FARMER_RICH_MENU
        const richMenuId = await createRichMenu(menu, accessToken)

        if (!richMenuId) {
          return NextResponse.json(
            { error: "Failed to create rich menu" },
            { status: 500 }
          )
        }

        // TODO: Upload image ถ้ามี
        return NextResponse.json({
          success: true,
          richMenuId,
          message: `Created ${menuType} rich menu successfully`,
        })

      case "setDefault":
        const { richMenuId: defaultMenuId } = body
        const setDefaultSuccess = await setDefaultRichMenu(defaultMenuId, accessToken)

        return NextResponse.json({
          success: setDefaultSuccess,
          message: setDefaultSuccess
            ? "Set default rich menu successfully"
            : "Failed to set default rich menu",
        })

      case "linkToUser":
        const { richMenuId: linkMenuId } = body
        if (!userId) {
          return NextResponse.json(
            { error: "userId is required" },
            { status: 400 }
          )
        }

        const linkSuccess = await linkRichMenuToUser(userId, linkMenuId, accessToken)

        return NextResponse.json({
          success: linkSuccess,
          message: linkSuccess
            ? "Linked rich menu to user successfully"
            : "Failed to link rich menu to user",
        })

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Rich Menu API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ดึงรายการ Rich Menu
export async function GET(request: NextRequest) {
  try {
    const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json(
        { error: "LINE_CHANNEL_ACCESS_TOKEN not configured" },
        { status: 500 }
      )
    }

    const richMenus = await getRichMenuList(accessToken)

    return NextResponse.json({
      success: true,
      data: richMenus,
    })
  } catch (error) {
    console.error("Get Rich Menu error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ลบ Rich Menu
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const richMenuId = searchParams.get("richMenuId")

    if (!richMenuId) {
      return NextResponse.json(
        { error: "richMenuId is required" },
        { status: 400 }
      )
    }

    const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json(
        { error: "LINE_CHANNEL_ACCESS_TOKEN not configured" },
        { status: 500 }
      )
    }

    const success = await deleteRichMenu(richMenuId, accessToken)

    return NextResponse.json({
      success,
      message: success
        ? "Deleted rich menu successfully"
        : "Failed to delete rich menu",
    })
  } catch (error) {
    console.error("Delete Rich Menu error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
