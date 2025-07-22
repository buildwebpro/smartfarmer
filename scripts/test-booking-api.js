// Test script for bookings API
const testData = {
  customerName: "ทดสอบ ผู้จอง",
  phoneNumber: "0812345678",
  areaSize: "5.5",
  cropType: "rice",
  sprayType: "herbicide",
  gpsCoordinates: "13.7563,100.5018",
  selectedDate: "2025-07-25",
  notes: "ทดสอบระบบ",
  totalPrice: 2250,
  depositAmount: 675,
  lineUserId: "test-user-id"
};

fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
