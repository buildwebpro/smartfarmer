// Security and validation utilities

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9]{9,10}$/,
  bookingId: /^[A-Z]{2}[0-9]+$/,
  userId: /^[a-zA-Z0-9_-]+$/,
  name: /^[ก-๙a-zA-Z\s]{2,50}$/,
  address: /^[ก-๙a-zA-Z0-9\s\.,/-]{5,200}$/,
  gpsCoordinates: /^-?\d+\.?\d*,-?\d+\.?\d*$/,
}

// File validation
export const FILE_VALIDATION = {
  maxSize: 2 * 1024 * 1024, // 2MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
}

// Validation functions
export function validateEmail(email: string): boolean {
  return VALIDATION_PATTERNS.email.test(email?.trim() || '')
}

export function validatePhone(phone: string): boolean {
  const cleanPhone = phone?.replace(/[-\s()]/g, '') || ''
  return VALIDATION_PATTERNS.phone.test(cleanPhone)
}

export function validateBookingId(bookingId: string): boolean {
  return VALIDATION_PATTERNS.bookingId.test(bookingId?.trim() || '')
}

export function validateUserId(userId: string): boolean {
  return VALIDATION_PATTERNS.userId.test(userId?.trim() || '')
}

export function validateName(name: string): boolean {
  return VALIDATION_PATTERNS.name.test(name?.trim() || '')
}

export function validateAddress(address: string): boolean {
  return VALIDATION_PATTERNS.address.test(address?.trim() || '')
}

export function validateGpsCoordinates(coords: string): boolean {
  return VALIDATION_PATTERNS.gpsCoordinates.test(coords?.trim() || '')
}

export function validateAreaSize(size: string | number): boolean {
  const num = typeof size === 'string' ? parseFloat(size) : size
  return !isNaN(num) && num > 0 && num <= 1000 // max 1000 rai
}

export function validateDate(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  const minDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
  const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
  
  return date >= minDate && date <= maxDate
}

// File validation
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'ไม่พบไฟล์' }
  }

  if (file.size > FILE_VALIDATION.maxSize) {
    return { valid: false, error: 'ขนาดไฟล์ต้องไม่เกิน 2MB' }
  }

  if (!FILE_VALIDATION.allowedTypes.includes(file.type)) {
    return { valid: false, error: 'รองรับเฉพาะไฟล์รูปภาพ (.jpg, .png, .webp)' }
  }

  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  if (!FILE_VALIDATION.allowedExtensions.includes(extension)) {
    return { valid: false, error: 'นามสกุลไฟล์ไม่ถูกต้อง' }
  }

  return { valid: true }
}

// XSS Prevention
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>]/g, '')
}

// SQL Injection Prevention
export function sanitizeForDatabase(input: string): string {
  if (!input) return ''
  
  return input
    .trim()
    .replace(/['";\\]/g, '') // Remove dangerous characters
    .substring(0, 255) // Limit length
}

// Validate booking data
export function validateBookingData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!validateName(data.customerName)) {
    errors.push('ชื่อลูกค้าไม่ถูกต้อง')
  }

  if (!validatePhone(data.phoneNumber)) {
    errors.push('เบอร์โทรศัพท์ไม่ถูกต้อง')
  }

  if (!validateAreaSize(data.areaSize)) {
    errors.push('ขนาดพื้นที่ไม่ถูกต้อง')
  }

  if (data.gpsCoordinates && !validateGpsCoordinates(data.gpsCoordinates)) {
    errors.push('พิกัด GPS ไม่ถูกต้อง')
  }

  if (data.selectedDate && !validateDate(data.selectedDate)) {
    errors.push('วันที่จองไม่ถูกต้อง')
  }

  if (!data.cropType || !data.sprayType) {
    errors.push('กรุณาเลือกชนิดพืชและประเภทการพ่น')
  }

  return { valid: errors.length === 0, errors }
}

// Rate limiting helper
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, number[]>()

  return function isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - windowMs

    if (!requests.has(identifier)) {
      requests.set(identifier, [now])
      return true
    }

    const userRequests = requests.get(identifier)!
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart)
    
    if (validRequests.length >= maxRequests) {
      return false
    }

    validRequests.push(now)
    requests.set(identifier, validRequests)
    return true
  }
}

// Security logging
export function logSecurityEvent(event: string, details: any, request?: any) {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: request?.headers?.get('x-forwarded-for') || request?.headers?.get('x-real-ip') || 'unknown',
    userAgent: request?.headers?.get('user-agent') || 'unknown',
  }

  // In production, send to security monitoring service
  console.warn('SECURITY EVENT:', JSON.stringify(logData))
}
