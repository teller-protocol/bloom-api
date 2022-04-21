 
import nodemailer from 'nodemailer'

require('dotenv').config()
 
const emailConfig = require('../server/config/emailConfig.json')

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class MailSender {
    
    transporter:any 
  
  constructor(){

    const SMTP_USERNAME = process.env.SMTP_USERNAME 
    const SMTP_PASSWORD = process.env.SMTP_PASSWORD 

    this.transporter = nodemailer.createTransport(
        {
            host: emailConfig.SMTP_HOST,
            auth:{
                user: SMTP_USERNAME,
                pass: SMTP_PASSWORD
            }
        }
    )

  }

  
  sendEmail(subject: string, text: string) {
     
  }
}
