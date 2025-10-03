const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pdnxfckzwlnlqapotepl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbnhmY2t6d2xubHFhcG90ZXBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc1MTEzMywiZXhwIjoyMDY4MzI3MTMzfQ.b8abFTU8RaBmN7FdPj-ORhoWgSArGTatAkK_p5IPc5Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertDemoEquipment() {
  try {
    console.log('Fetching equipment categories...');

    const { data: categories, error: catError } = await supabase
      .from('equipment_categories')
      .select('id, name');

    if (catError) {
      console.error('Error fetching categories:', catError);
      return;
    }

    console.log('Found categories:', categories.map(c => c.name));

    const equipmentData = [
      {
        category_id: categories.find(c => c.name === 'รถไถ')?.id,
        name: 'รถไถ Kubota L4508',
        model: 'L4508',
        brand: 'Kubota',
        description: 'รถไถ Kubota 45 แรงม้า ระบบ 4WD เหมาะสำหรับไถนาและทำสวน มีระบบส่งกำลังแบบ Hydrostatic ใช้งานง่าย เหมาะสำหรับพื้นที่ 5-20 ไร่',
        specifications: {
          horsepower: '45 HP',
          drive: '4WD',
          transmission: 'hydrostatic',
          weight: '1800kg',
          fuel_tank: '38L'
        },
        status: 'available',
        rental_price_per_day: 1500.00,
        rental_price_per_hour: 300.00,
        deposit_amount: 3000.00,
        current_location: 'ฐานหลัก นครราชสีมา',
        condition: 'excellent'
      },
      {
        category_id: categories.find(c => c.name === 'รถเกี่ยวข้าว')?.id,
        name: 'รถเกี่ยวข้าว Kubota DC70',
        model: 'DC70',
        brand: 'Kubota',
        description: 'รถเกี่ยวข้าวแบบนั่งขับ กว้างตัด 1.65 เมตร ความจุถังข้าวเปลือก 80 กก. มีระบบ HST ขับเคลื่อนง่าย เหมาะสำหรับนาขนาด 10-50 ไร่',
        specifications: {
          type: 'combine harvester',
          cutting_width: '1.65m',
          tank_capacity: '80kg',
          engine: 'diesel',
          fuel_efficiency: 'excellent'
        },
        status: 'available',
        rental_price_per_day: 2500.00,
        rental_price_per_hour: 500.00,
        deposit_amount: 5000.00,
        current_location: 'ฐานหลัก นครราชสีมา',
        condition: 'good'
      },
      {
        category_id: categories.find(c => c.name === 'เครื่องสูบน้ำ')?.id,
        name: 'ปั๊มน้ำ Honda WB30',
        model: 'WB30',
        brand: 'Honda',
        description: 'ปั๊มน้ำเบนซิน Honda 3 นิ้ว อัตราการสูบ 1,100 ลิตร/นาที ยกน้ำได้สูง 26 เมตร เครื่องยนต์ 5.5 แรงม้า ประหยัดน้ำมัน เหมาะสำหรับการสูบน้ำเข้านา',
        specifications: {
          flow_rate: '1100 L/min',
          power: '5.5 HP',
          fuel: 'gasoline',
          max_head: '26m',
          inlet_outlet: '3 inch'
        },
        status: 'available',
        rental_price_per_day: 400.00,
        rental_price_per_hour: 80.00,
        deposit_amount: 1000.00,
        current_location: 'ฐานหลัก นครราชสีมา',
        condition: 'excellent'
      }
    ];

    console.log('\nInserting equipment...');

    for (const item of equipmentData) {
      if (!item.category_id) {
        console.error(`✗ Category not found for: ${item.name}`);
        continue;
      }

      // Use direct REST API call
      const response = await fetch(`${supabaseUrl}/rest/v1/equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`✗ Error inserting ${item.name}:`, error);
      } else {
        const result = await response.json();
        console.log(`✓ Inserted: ${item.name}`);
      }
    }

    console.log('\nDone!');
  } catch (err) {
    console.error('Error:', err);
  }
}

insertDemoEquipment();
