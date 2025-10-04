import { GoogleGenerativeAI } from "@google/generative-ai"

const GEMINI_API_KEY = "AIzaSyDcMzY_EyWAOMK1o7DGek37b8DjKKAdpDM"
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

// ข้อมูลระบบบริการ
const SYSTEM_INFO = `
คุณเป็น AI Assistant สำหรับบริษัท พระพิรุนทร์ เซอร์วิส โพรไวเดอร์ จำกัด
ให้บริการด้านเกษตรแบบครบวงจร:

## บริการหลัก:
1. **บริการพ่นยาโดรน**
   - โดรนพร้อมให้บริการ 6 ลำ
   - นักบินมืออาชีพมีใบอนุญาต
   - ประสิทธิภาพสูง ประหยัดเวลา

2. **เช่าเครื่องจักรเกษตร**
   - รถไถ (Tractors)
   - รถเกี่ยว (Harvesters)
   - รถหว่าน (Seeders)
   - เครื่องพ่นยา (Sprayers)
   - และอื่นๆ

## ราคาบริการพ่นยาโดรน:

### ชนิดพืช:
- ข้าว: 300 บาท/ไร่
- ข้าวโพด: 350 บาท/ไร่
- อ้อย: 400 บาท/ไร่
- มันสำปะหลัง: 320 บาท/ไร่
- ยางพารา: 380 บาท/ไร่

### ชนิดสารพ่น:
- ยาฆ่าหญ้า: 100 บาท/ไร่
- ยาฆ่าแมลง: 150 บาท/ไร่
- ปุ่ยเหลว: 200 บาท/ไร่
- ยาฆ่าเชื้อรา: 180 บาท/ไร่

### การคำนวณ:
ราคารวม = (ราคาพืช + ราคาสาร) × จำนวนไร่
มัดจำ 30% ของราคารวม

## การจอง:
- จองล่วงหน้าอย่างน้อย 3 วัน
- ระบุที่อยู่แปลงเกษตรที่ชัดเจน
- ใช้ LINE LIFF เพื่อจองบริการ

## เงื่อนไขการเช่า:
- ยอมรับเงื่อนไขการเช่า
- รับผิดชอบค่าน้ำมันเชื้อเพลิง
- คืนเครื่องในสภาพเรียบร้อย
- รับทราบนโยบายค่าเสียหาย

## ช่องทางติดต่อ:
- LINE Official Account
- โทร: 02-xxx-xxxx
- เว็บไซต์: [URL]

ตอบคำถามด้วยความเป็นมิตร ชัดเจน กระชับ และให้ข้อมูลที่ถูกต้อง
`

export async function getAIResponse(userMessage: string, conversationHistory: string[] = []): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INFO
    })

    // สร้าง conversation context
    const context = conversationHistory.length > 0
      ? `ประวัติการสนทนา:\n${conversationHistory.join('\n')}\n\n`
      : ''

    const prompt = `${context}ลูกค้าถาม: ${userMessage}\n\nตอบคำถามอย่างกระชับและเป็นมิตร:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text || "ขออภัยครับ ไม่สามารถตอบคำถามได้ในขณะนี้"
  } catch (error) {
    console.error("Gemini AI Error:", error)
    return "ขอโทษครับ ระบบ AI มีปัญหาชั่วคราว กรุณาติดต่อเจ้าหน้าที่โดยตรงครับ"
  }
}

// ตรวจสอบว่าเป็นคำถามทั่วไปหรือไม่
export function shouldUseAI(message: string): boolean {
  const commandKeywords = [
    'จอง', 'booking', 'book',
    'สถานะ', 'status', 'ตรวจสอบ',
    'ราคา', 'price', 'เท่าไร',
  ]

  const lowerMessage = message.toLowerCase()

  // ถ้าเป็นคำสั่งเฉพาะ ไม่ต้องใช้ AI
  const isSpecificCommand = commandKeywords.some(keyword =>
    lowerMessage.includes(keyword.toLowerCase())
  )

  return !isSpecificCommand
}

// สร้างคำแนะนำจาก AI
export async function getServiceRecommendation(
  cropType: string,
  areaSize: number,
  purpose: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
ในฐานะผู้เชี่ยวชาญด้านเกษตร แนะนำบริการที่เหมาะสมสำหรับ:
- ประเภทพืช: ${cropType}
- ขนาดพื้นที่: ${areaSize} ไร่
- วัตถุประสงค์: ${purpose}

แนะนำ:
1. ชนิดสารที่เหมาะสม
2. ช่วงเวลาที่เหมาะสมในการพ่น
3. ข้อควรระวัง
4. ราคาโดยประมาณ

ตอบแบบกระชับ เข้าใจง่าย ไม่เกิน 200 คำ
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("AI Recommendation Error:", error)
    return "ขอแนะนำให้ติดต่อเจ้าหน้าที่โดยตรงเพื่อรับคำปรึกษาที่เหมาะสมครับ"
  }
}
