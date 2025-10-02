const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pdnxfckzwlnlqapotepl.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbnhmY2t6d2xubHFhcG90ZXBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc1MTEzMywiZXhwIjoyMDY4MzI3MTMzfQ.b8abFTU8RaBmN7FdPj-ORhoWgSArGTatAkK_p5IPc5Y';

async function runSQL(sql, description) {
  console.log(`\n🔄 ${description}...`);

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    });

    // Alternative: use pg_query endpoint
    const response2 = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: sql
    });

    if (response2.ok) {
      console.log(`✅ ${description} - สำเร็จ!`);
      return true;
    } else {
      const error = await response2.text();
      console.error(`❌ ${description} - ล้มเหลว:`, error);
      return false;
    }
  } catch (error) {
    console.error(`❌ ${description} - เกิดข้อผิดพลาด:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 กำลังรัน AgriConnect v2.0 Migration...\n');
  console.log('📍 Supabase URL:', SUPABASE_URL);

  // Read SQL files
  const migrationSQL = fs.readFileSync(
    path.join(__dirname, 'agriconnect-v2-migration.sql'),
    'utf8'
  );

  const rlsSQL = fs.readFileSync(
    path.join(__dirname, 'agriconnect-v2-rls-policies.sql'),
    'utf8'
  );

  const helperSQL = `
CREATE OR REPLACE FUNCTION increment_proposal_count(job_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE job_postings
    SET proposal_count = COALESCE(proposal_count, 0) + 1
    WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;
  `;

  // Run migrations
  console.log('\n========================================');
  console.log('STEP 1: Main Migration (สร้าง Tables)');
  console.log('========================================');

  const step1 = await runSQL(migrationSQL, 'สร้างตารางและ seed data');

  console.log('\n========================================');
  console.log('STEP 2: RLS Policies (ความปลอดภัย)');
  console.log('========================================');

  const step2 = await runSQL(rlsSQL, 'ตั้งค่า Row Level Security');

  console.log('\n========================================');
  console.log('STEP 3: Helper Functions');
  console.log('========================================');

  const step3 = await runSQL(helperSQL, 'สร้าง helper functions');

  // Summary
  console.log('\n========================================');
  console.log('📊 สรุปผลการทำงาน');
  console.log('========================================');
  console.log(`Step 1 (Migration):     ${step1 ? '✅ สำเร็จ' : '❌ ล้มเหลว'}`);
  console.log(`Step 2 (RLS Policies):  ${step2 ? '✅ สำเร็จ' : '❌ ล้มเหลว'}`);
  console.log(`Step 3 (Helper Funcs):  ${step3 ? '✅ สำเร็จ' : '❌ ล้มเหลว'}`);

  if (step1 && step2 && step3) {
    console.log('\n🎉 Migration เสร็จสมบูรณ์!');
    console.log('\n📝 ขั้นตอนถัดไป:');
    console.log('1. ตรวจสอบตารางใน Supabase Dashboard');
    console.log('2. รัน: npm run dev');
    console.log('3. เข้าใช้งาน: http://localhost:3000/farmer/dashboard');
  } else {
    console.log('\n⚠️  มีบางส่วนที่ล้มเหลว - กรุณารัน SQL ด้วยตนเองใน Supabase SQL Editor');
  }
}

main().catch(console.error);
