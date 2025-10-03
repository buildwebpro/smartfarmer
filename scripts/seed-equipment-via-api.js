// Seed demo equipment via API
const equipmentData = [
  {
    category_name: 'รถไถ',
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
    rental_price_per_day: 1500,
    rental_price_per_hour: 300,
    deposit_amount: 3000,
    current_location: 'ฐานหลัก นครราชสีมา'
  },
  {
    category_name: 'รถเกี่ยวข้าว',
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
    rental_price_per_day: 2500,
    rental_price_per_hour: 500,
    deposit_amount: 5000,
    current_location: 'ฐานหลัก นครราชสีมา'
  },
  {
    category_name: 'เครื่องสูบน้ำ',
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
    rental_price_per_day: 400,
    rental_price_per_hour: 80,
    deposit_amount: 1000,
    current_location: 'ฐานหลัก นครราชสีมา'
  }
];

console.log('Copy this data and use it to add equipment via the admin panel:');
console.log(JSON.stringify(equipmentData, null, 2));
