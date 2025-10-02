import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if line_user_id column exists
    const { data: columns, error } = await supabase
      .from('customers')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }

    // Try to check column existence by attempting to query it
    const { data: testData, error: testError } = await supabase
      .from('customers')
      .select('line_user_id')
      .limit(1)

    const hasLineUserIdColumn = !testError

    return NextResponse.json({
      success: true,
      hasLineUserIdColumn,
      sampleData: testData,
      error: testError?.message,
      instruction: !hasLineUserIdColumn
        ? {
            message: 'line_user_id column is missing',
            sql: `ALTER TABLE customers ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(255) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_customers_line_user_id ON customers(line_user_id);`,
            steps: [
              '1. Go to https://supabase.com/dashboard/project/pdnxfckzwlnlqapotepl/sql',
              '2. Copy the SQL above',
              '3. Paste and click "Run"'
            ]
          }
        : { message: 'line_user_id column exists' }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
