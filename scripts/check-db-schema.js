const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkPilotsSchema() {
  console.log('🔍 ตรวจสอบโครงสร้างตาราง pilots...\n')

  try {
    // ตรวจสอบคอลัมน์ในตาราง pilots โดยใช้ rpc
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'pilots' })

    if (columnsError) {
      console.log('⚠️ ไม่สามารถใช้ RPC ได้ ลองวิธีอื่น...')
      
      // ลองดึงข้อมูลตัวอย่างจากตาราง pilots
      const { data: sampleData, error: sampleError } = await supabase
        .from('pilots')
        .select('*')
        .limit(1)
        .single()

      if (sampleError && sampleError.code !== 'PGRST116') {
        console.error('❌ ไม่สามารถเข้าถึงตาราง pilots:', sampleError)
        return
      }

      if (sampleData) {
        console.log('✅ ตาราง pilots มีอยู่')
        console.log('📋 คอลัมน์ที่พบในข้อมูลตัวอย่าง:')
        const existingColumns = Object.keys(sampleData)
        existingColumns.forEach((col, index) => {
          console.log(`${index + 1}. ${col}: ${typeof sampleData[col]}`)
        })

        // เปรียบเทียบกับคอลัมน์ที่ควรมี
        const expectedColumns = [
          'id', 'name', 'phone', 'email', 'line_id', 'address',
          'profile_image_url', 'birth_date', 'gender', 'national_id', 'passport_no',
          'uas_license_no', 'uas_license_expiry', 'insurance_policy', 'special_certificates',
          'total_flight_hours', 'agricultural_hours', 'other_hours', 'drone_models_experience',
          'projects_completed', 'accident_rate', 'status', 'current_location_lat',
          'current_location_lng', 'current_location_updated_at', 'license_expiry_notified',
          'availability_schedule', 'health_check_date', 'health_status', 'safety_score',
          'safety_warnings', 'last_safety_training', 'average_rating', 'total_reviews',
          'punctuality_score', 'quality_score', 'completion_rate', 'role', 'permissions',
          'last_login', 'created_at', 'updated_at', 'is_active', 'experience_years', 'certifications'
        ]

        const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col))
        const extraColumns = existingColumns.filter(col => !expectedColumns.includes(col))

        console.log('\n📊 สรุปการตรวจสอบ:')
        console.log(`✅ คอลัมน์ที่มีอยู่: ${existingColumns.length} คอลัมน์`)
        console.log(`❌ คอลัมน์ที่หายไป: ${missingColumns.length} คอลัมน์`)
        console.log(`ℹ️ คอลัมน์เพิ่มเติม: ${extraColumns.length} คอลัมน์`)

        if (missingColumns.length > 0) {
          console.log('\n🚨 คอลัมน์ที่หายไป:')
          missingColumns.forEach(col => console.log(`   - ${col}`))
        }

        if (extraColumns.length > 0) {
          console.log('\n📝 คอลัมน์เพิ่มเติม:')
          extraColumns.forEach(col => console.log(`   - ${col}`))
        }
      } else {
        console.log('⚠️ ตาราง pilots ว่างเปล่า ไม่สามารถตรวจสอบโครงสร้างได้')
      }
    }

    // ตรวจสอบตารางเสริม
    console.log('\n🔍 ตรวจสอบตารางเสริม...')
    const expectedTables = ['pilot_flight_logs', 'pilot_notifications', 'pilot_trainings']
    
    for (const tableName of expectedTables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1)

      if (error) {
        console.log(`❌ ตาราง ${tableName}: ไม่พบ (${error.message})`)
      } else {
        console.log(`✅ ตาราง ${tableName}: พบแล้ว`)
      }
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error)
  }
}

// รันการตรวจสอบ
checkPilotsSchema()
