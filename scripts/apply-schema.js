const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '../.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyEnhancedSchema() {
  console.log('🚀 เริ่มอัพเดทโครงสร้างฐานข้อมูล...\n')

  try {
    // อ่านไฟล์ SQL
    const sqlFile = path.join(__dirname, 'enhanced-pilots-schema.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    
    // แบ่ง SQL เป็นคำสั่งแยกๆ (แยกด้วย semicolon และ newlines)
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

    console.log(`📝 พบ ${sqlCommands.length} คำสั่ง SQL`)

    let successCount = 0
    let errorCount = 0

    // รันคำสั่ง SQL ทีละคำสั่ง
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i]
      if (command.trim() === '') continue

      console.log(`\n⏳ รันคำสั่งที่ ${i + 1}: ${command.substring(0, 50)}...`)

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: command })
        
        if (error) {
          console.log(`❌ ผิดพลาด: ${error.message}`)
          errorCount++
        } else {
          console.log(`✅ สำเร็จ`)
          successCount++
        }
      } catch (err) {
        console.log(`❌ Exception: ${err.message}`)
        errorCount++
      }

      // หน่วงเวลาสั้นๆ เพื่อไม่ให้ flood database
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`\n📊 สรุปผลการรัน:`)
    console.log(`✅ สำเร็จ: ${successCount} คำสั่ง`)
    console.log(`❌ ผิดพลาด: ${errorCount} คำสั่ง`)

    if (errorCount === 0) {
      console.log('\n🎉 อัพเดทโครงสร้างฐานข้อมูลสำเร็จทั้งหมด!')
    } else {
      console.log('\n⚠️ มีข้อผิดพลาดบางส่วน กรุณาตรวจสอบ Supabase Dashboard')
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดหลัก:', error)
  }
}

// รันการอัพเดท
applyEnhancedSchema()
