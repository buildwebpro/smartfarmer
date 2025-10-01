const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Starting equipment system migration...')

    // Read SQL file
    const sqlPath = path.join(__dirname, 'add-equipment-system.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // Split by semicolon and filter out empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'))

    console.log(`📝 Found ${statements.length} SQL statements to execute`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`)

      try {
        // Execute via RPC or direct query
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        }).catch(async (rpcError) => {
          // If RPC doesn't exist, try direct query (for simple queries)
          console.log('  RPC not available, trying direct execution...')

          // For ALTER/CREATE/INSERT, we need to use the REST API directly
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ sql_query: statement + ';' })
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          return { data: null, error: null }
        })

        if (error) {
          console.error(`  ❌ Error:`, error.message)
          errorCount++
        } else {
          console.log(`  ✅ Success`)
          successCount++
        }
      } catch (err) {
        console.error(`  ❌ Error:`, err.message)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Successfully executed: ${successCount} statements`)
    console.log(`❌ Failed: ${errorCount} statements`)
    console.log('='.repeat(50))

    if (errorCount > 0) {
      console.log('\n⚠️  Some statements failed. Please check the errors above.')
      console.log('💡 You may need to run the SQL manually in Supabase Dashboard.')
      console.log(`   Go to: ${supabaseUrl.replace('https://', 'https://app.')}/project/_/sql`)
    } else {
      console.log('\n🎉 Migration completed successfully!')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
runMigration()
