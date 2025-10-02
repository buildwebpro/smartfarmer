import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@supabase/supabase-js'

const LINE_CHANNEL_ID = process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID || '2006634414'
const LINE_CHANNEL_SECRET = process.env.LINE_LOGIN_CHANNEL_SECRET || ''
const CALLBACK_URL = process.env.NEXT_PUBLIC_LINE_CALLBACK_URL || 'http://localhost:3000/auth/callback'

export async function POST(request: Request) {
  try {
    const { code, role } = await request.json()

    // Use Service Role Key to bypass RLS
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    if (!LINE_CHANNEL_SECRET) {
      return NextResponse.json(
        { success: false, error: 'LINE_LOGIN_CHANNEL_SECRET is not configured' },
        { status: 500 }
      )
    }

    // Step 1: Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: CALLBACK_URL,
        client_id: LINE_CHANNEL_ID,
        client_secret: LINE_CHANNEL_SECRET,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('LINE token exchange failed:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to exchange authorization code' },
        { status: 400 }
      )
    }

    const tokenData = await tokenResponse.json()
    const { access_token, id_token } = tokenData

    // Step 2: Get LINE user profile
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!profileResponse.ok) {
      const error = await profileResponse.text()
      console.error('LINE profile fetch failed:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch LINE profile' },
        { status: 400 }
      )
    }

    const lineProfile = await profileResponse.json()
    const { userId, displayName, pictureUrl } = lineProfile

    // Step 3: Get email from ID token (if available)
    let email = null
    if (id_token) {
      try {
        // Decode JWT (simple base64 decode, not verifying signature for now)
        const payload = JSON.parse(
          Buffer.from(id_token.split('.')[1], 'base64').toString()
        )
        email = payload.email
      } catch (e) {
        console.log('Could not extract email from ID token')
      }
    }

    // Step 4: Create or update user in Supabase (using service role key from above)

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('line_user_id', userId)
      .single()

    let user

    if (existingUser) {
      // Update existing user - only update fields that exist in schema
      const updateData: any = {
        name: displayName,
        updated_at: new Date().toISOString(),
      }

      // Check if columns exist before updating
      if ('avatar_url' in existingUser) updateData.avatar_url = pictureUrl
      if ('role' in existingUser) updateData.role = role || existingUser.role

      const { data: updatedUser, error: updateError } = await supabase
        .from('customers')
        .update(updateData)
        .eq('line_user_id', userId)
        .select()
        .single()

      if (updateError) {
        console.error('Failed to update user:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update user' },
          { status: 500 }
        )
      }

      user = updatedUser
    } else {
      // Create new user - start with basic required fields
      // phone column is VARCHAR(20), so we need to keep it short
      const phoneValue = email ? email.substring(0, 20) : '-'

      const insertData: any = {
        name: displayName,
        phone: phoneValue,
        line_user_id: userId,
      }

      // Add optional fields if they exist in the schema
      // We'll detect this by trying to insert and catching the error
      const { data: newUser, error: createError } = await supabase
        .from('customers')
        .insert(insertData)
        .select()
        .single()

      if (createError) {
        console.error('Failed to create user:', createError)
        console.error('User data:', { name: displayName, email, userId, role })
        return NextResponse.json(
          { success: false, error: `Failed to create user: ${createError.message}` },
          { status: 500 }
        )
      }

      user = newUser
    }

    // Step 5: Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email || null,
        avatar_url: user.avatar_url || null,
        role: user.role || role || 'farmer',
        line_user_id: user.line_user_id,
      },
    })
  } catch (error: any) {
    console.error('LINE callback error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
