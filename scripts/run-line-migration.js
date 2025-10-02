const https = require('https');

const SUPABASE_URL = 'https://pdnxfckzwlnlqapotepl.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbnhmY2t6d2xubHFhcG90ZXBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc1MTEzMywiZXhwIjoyMDY4MzI3MTMzfQ.b8abFTU8RaBmN7FdPj-ORhoWgSArGTatAkK_p5IPc5Y';

const sql = `
-- Add LINE user ID column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(255) UNIQUE;

-- Create index for faster LINE user lookups
CREATE INDEX IF NOT EXISTS idx_customers_line_user_id ON customers(line_user_id);
`;

console.log('🚀 กำลังรัน LINE Migration...\n');
console.log('📝 SQL Statement:');
console.log(sql);
console.log('\n⚠️  เนื่องจาก Supabase REST API ไม่รองรับ SQL execution');
console.log('กรุณารัน SQL ข้างต้นใน Supabase SQL Editor:\n');
console.log('1. ไปที่ https://supabase.com/dashboard/project/pdnxfckzwlnlqapotepl/sql');
console.log('2. Copy SQL statement ข้างบน');
console.log('3. Paste ใน SQL Editor');
console.log('4. คลิก "Run"\n');
console.log('✅ หรือรันคำสั่งนี้แทน:');
console.log('\nALTER TABLE customers ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(255) UNIQUE;');
console.log('CREATE INDEX IF NOT EXISTS idx_customers_line_user_id ON customers(line_user_id);');
