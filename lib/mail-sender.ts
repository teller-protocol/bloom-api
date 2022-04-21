 
import nodemailer from 'nodemailer'

require('dotenv').config()
 
const emailConfig = require('../server/config/emailConfig.json')
 
export default class MailSender {
    
  transporter:any 
  
  constructor(){

    const SMTP_USERNAME = process.env.SMTP_USERNAME 
    const SMTP_PASSWORD = process.env.SMTP_PASSWORD 

    if(!SMTP_USERNAME || !SMTP_PASSWORD){
        throw 'Missing SMTP credentials. Configure in .env file.'
    }

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

    this.transporter.sendEmail({
        from: emailConfig.SMTP_FROM, 
        to: emailConfig.SMTP_TO,  
        subject,
        text
    })
  }
}
