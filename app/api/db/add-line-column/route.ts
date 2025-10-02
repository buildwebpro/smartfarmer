import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Try to add the column using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='customers' AND column_name='line_user_id'
          ) THEN
            ALTER TABLE customers ADD COLUMN line_user_id VARCHAR(255) UNIQUE;
            CREATE INDEX idx_customers_line_user_id ON customers(line_user_id);
          END IF;
        END $$;
      `
    })

    if (error) {
      console.error('SQL execution error:', error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          suggestion: 'Please run the SQL manually in Supabase SQL Editor'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'line_user_id column added successfully'
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        sql: `ALTER TABLE customers ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(255) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_customers_line_user_id ON customers(line_user_id);`
      },
      { status: 500 }
    )
  }
}
