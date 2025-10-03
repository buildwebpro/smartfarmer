const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pdnxfckzwlnlqapotepl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbnhmY2t6d2xubHFhcG90ZXBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc1MTEzMywiZXhwIjoyMDY4MzI3MTMzfQ.b8abFTU8RaBmN7FdPj-ORhoWgSArGTatAkK_p5IPc5Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  try {
    console.log('Checking equipment table...');

    const { data, error, count } = await supabase
      .from('equipment')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Equipment table does not exist or error:', error.message);
      console.log('\n💡 You need to create the equipment table first.');
      console.log('Run the SQL from scripts/add-equipment-system.sql in Supabase Dashboard');
      return false;
    }

    console.log('✅ Equipment table exists!');
    console.log(`   Current count: ${count || 0} items`);
    return true;
  } catch (err) {
    console.error('Error:', err.message);
    return false;
  }
}

checkTable();
