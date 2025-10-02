import { Client, FlexMessage, TextMessage } from '@line/bot-sdk'

const client = new Client({
  channelAccessToken: process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_MESSAGING_CHANNEL_SECRET || ''
})

// Notification Templates

export function createNewProposalNotification(data: {
  providerName: string
  jobTitle: string
  price: number
  jobId: string
}): FlexMessage {
  return {
    type: 'flex',
    altText: 'คุณมีข้อเสนองานใหม่!',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '📬 ข้อเสนองานใหม่',
            weight: 'bold',
            size: 'xl',
            color: '#16a34a'
          },
          {
            type: 'text',
            text: `${data.providerName} ส่งข้อเสนอให้คุณ`,
            margin: 'md',
            wrap: true
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  { type: 'text', text: 'งาน:', color: '#aaaaaa', size: 'sm', flex: 1 },
                  { type: 'text', text: data.jobTitle, wrap: true, size: 'sm', flex: 4 }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  { type: 'text', text: 'ราคา:', color: '#aaaaaa', size: 'sm', flex: 1 },
                  {
                    type: 'text',
                    text: `${data.price.toLocaleString()} บาท`,
                    color: '#16a34a',
                    weight: 'bold',
                    size: 'sm',
                    flex: 4
                  }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'ดูรายละเอียด',
              uri: `${process.env.NEXT_PUBLIC_BASE_URL}/farmer/my-jobs?job=${data.jobId}`
            },
            style: 'primary',
            color: '#16a34a'
          }
        ]
      }
    }
  }
}

export function createProposalAcceptedNotification(data: {
  jobTitle: string
  date: string
  price: number
  proposalId: string
}): FlexMessage {
  return {
    type: 'flex',
    altText: '🎉 ข้อเสนอของคุณได้รับการยอมรับ!',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🎉 ยอมรับข้อเสนอแล้ว!',
            weight: 'bold',
            size: 'xl',
            color: '#16a34a'
          },
          {
            type: 'text',
            text: 'เกษตรกรยอมรับข้อเสนอของคุณ',
            margin: 'md',
            wrap: true
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  { type: 'text', text: 'งาน:', color: '#aaaaaa', size: 'sm', flex: 1 },
                  { type: 'text', text: data.jobTitle, wrap: true, size: 'sm', flex: 4 }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  { type: 'text', text: 'วันที่:', color: '#aaaaaa', size: 'sm', flex: 1 },
                  { type: 'text', text: data.date, size: 'sm', flex: 4 }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  { type: 'text', text: 'ราคา:', color: '#aaaaaa', size: 'sm', flex: 1 },
                  {
                    type: 'text',
                    text: `${data.price.toLocaleString()} บาท`,
                    color: '#16a34a',
                    weight: 'bold',
                    size: 'sm',
                    flex: 4
                  }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'ดูรายละเอียดงาน',
              uri: `${process.env.NEXT_PUBLIC_BASE_URL}/provider/my-proposals?proposal=${data.proposalId}`
            },
            style: 'primary',
            color: '#16a34a'
          }
        ]
      }
    }
  }
}

export function createJobCompletedNotification(data: {
  jobTitle: string
  jobId: string
  recipientType: 'farmer' | 'provider'
}): FlexMessage {
  return {
    type: 'flex',
    altText: 'งานเสร็จสมบูรณ์แล้ว!',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '✅ งานเสร็จสมบูรณ์',
            weight: 'bold',
            size: 'xl',
            color: '#16a34a'
          },
          {
            type: 'text',
            text: data.recipientType === 'farmer'
              ? 'ขอบคุณที่ใช้บริการ SmartFarmer'
              : 'คุณได้ทำงานเสร็จสมบูรณ์แล้ว',
            margin: 'md',
            wrap: true
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: data.recipientType === 'farmer'
                  ? 'กรุณาให้คะแนนและรีวิวผู้ให้บริการ'
                  : 'รอเกษตรกรยืนยันและให้คะแนน',
                color: '#666666',
                size: 'sm',
                wrap: true
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: data.recipientType === 'farmer' ? 'ให้คะแนนและรีวิว' : 'ดูรายละเอียด',
              uri: `${process.env.NEXT_PUBLIC_BASE_URL}/review/${data.jobId}`
            },
            style: 'primary',
            color: '#16a34a'
          }
        ]
      }
    }
  }
}

export function createJobReminderNotification(data: {
  jobTitle: string
  date: string
  time: string
  jobId: string
}): FlexMessage {
  return {
    type: 'flex',
    altText: '⏰ เตือนความจำ: งานพรุ่งนี้',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '⏰ เตือนความจำ',
            weight: 'bold',
            size: 'xl',
            color: '#f59e0b'
          },
          {
            type: 'text',
            text: 'คุณมีงานพรุ่งนี้',
            margin: 'md',
            wrap: true
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  { type: 'text', text: 'งาน:', color: '#aaaaaa', size: 'sm', flex: 1 },
                  { type: 'text', text: data.jobTitle, wrap: true, size: 'sm', flex: 4 }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  { type: 'text', text: 'วันที่:', color: '#aaaaaa', size: 'sm', flex: 1 },
                  { type: 'text', text: data.date, size: 'sm', flex: 4 }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  { type: 'text', text: 'เวลา:', color: '#aaaaaa', size: 'sm', flex: 1 },
                  { type: 'text', text: data.time, size: 'sm', flex: 4 }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'ดูรายละเอียด',
              uri: `${process.env.NEXT_PUBLIC_BASE_URL}/jobs/${data.jobId}`
            },
            style: 'primary',
            color: '#f59e0b'
          }
        ]
      }
    }
  }
}

// Helper Functions

export async function sendPushMessage(lineUserId: string, message: FlexMessage | TextMessage) {
  if (!process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN) {
    console.warn('LINE_MESSAGING_CHANNEL_ACCESS_TOKEN not configured')
    return
  }

  try {
    await client.pushMessage(lineUserId, message)
    console.log(`Sent message to ${lineUserId}`)
  } catch (error) {
    console.error('Error sending LINE message:', error)
    throw error
  }
}

export async function sendMulticastMessage(lineUserIds: string[], message: FlexMessage | TextMessage) {
  if (!process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN) {
    console.warn('LINE_MESSAGING_CHANNEL_ACCESS_TOKEN not configured')
    return
  }

  try {
    await client.multicast(lineUserIds, message)
    console.log(`Sent multicast message to ${lineUserIds.length} users`)
  } catch (error) {
    console.error('Error sending LINE multicast:', error)
    throw error
  }
}

export async function setRichMenuByRole(lineUserId: string, role: 'farmer' | 'provider') {
  const richMenuId = role === 'farmer'
    ? process.env.LINE_RICH_MENU_FARMER_ID
    : process.env.LINE_RICH_MENU_PROVIDER_ID

  if (!richMenuId) {
    console.warn(`Rich menu ID for ${role} not configured`)
    return
  }

  try {
    await client.linkRichMenuToUser(lineUserId, richMenuId)
    console.log(`Set ${role} rich menu for user ${lineUserId}`)
  } catch (error) {
    console.error('Error setting rich menu:', error)
    throw error
  }
}

export async function unlinkRichMenu(lineUserId: string) {
  try {
    await client.unlinkRichMenuFromUser(lineUserId)
    console.log(`Unlinked rich menu for user ${lineUserId}`)
  } catch (error) {
    console.error('Error unlinking rich menu:', error)
  }
}
