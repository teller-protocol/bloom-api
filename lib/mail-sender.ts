 

import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { ServiceException } from '@aws-sdk/smithy-client';
 

const AWS_REGION = 'us-east-2';


require('dotenv').config()
 
const emailConfig = require('../server/config/emailConfig.json')
 


const sesClient = new SESClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: process.env.SMTP_ACCESS_KEY_ID!,
      secretAccessKey: process.env.SMTP_SECRET_ACCESS_KEY!,
    },
  });


export default class MailSender {
    
  transporter:any 
  
  constructor(){

     
  }

  
  static async sendEmail(subject: string, text: string) {


    const params = {
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
                Charset: "UTF-8",
                Data: text
               }
          },
        },
        Source: emailConfig.SMTP_FROMs,
      };

    const data = await sesClient.send(new SendEmailCommand(params));

    return data 
  }
}
