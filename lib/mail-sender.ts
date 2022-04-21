import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { ServiceException } from '@aws-sdk/smithy-client'

require('dotenv').config()

const emailConfig = require('../server/config/emailConfig.json')

const sesClient = new SESClient({
  region: emailConfig.AWS_REGION,
  credentials: {
    accessKeyId: process.env.SMTP_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SMTP_SECRET_ACCESS_KEY!,
  },
})

export async function sendEmail(subject: string, text: string): Promise<any> {
  const params = {
    Source: emailConfig.SMTP_FROM,
    Destination: {
      ToAddresses: [emailConfig.SMTP_TO],
    },
    Message: {
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: text,
        },
      },
    },
  }

  const data = await sesClient.send(new SendEmailCommand(params))

  return data
}
