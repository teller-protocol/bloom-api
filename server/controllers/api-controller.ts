import { APICall } from 'mini-route-loader'
import { isCatchClause } from 'typescript'

import AppHelper from '../../lib/app-helper'
import { sendEmail } from '../../lib/mail-sender'
import MongoInterface, { WebhookReceipt } from '../../lib/mongo-interface'

const crypto = require('crypto')

const shouldSendEmail = AppHelper.getEnvironmentName() == 'production'


export default class ApiController {
  constructor(public mongoInterface: MongoInterface) {}

  ping: APICall = async (req: any, res: any) => {
    return res.status(200).send({ success: true })
  }

  /*
    @notice Accepts a webhook call from Bloom API 
 
  */

    async sendErrorEmail(loggedError: any ){

      try {
          
        if (shouldSendEmail) {

          let emailMessageText:string =  `An error has been logged:  ${loggedError.errorMessage} ` 

          let sentEmail = await sendEmail(
            'Bloom API Error',
            emailMessageText
          )
  
           
        }
      } catch (error) {
        console.error(error)
      }

    }

    async verifyHmacSignature( req: any ){

 
      const signature = req.headers['x-onramp-signature']

      let expectedSignature

      try{ 
        expectedSignature = crypto
          .createHmac('sha256', process.env.ONRAMP_WEBHOOK_KEY)
          .update(req.rawBody)
          .digest('base64')
      }catch(err){
        return  {
          success: false,
          error: 'invalid signature',
        }
      }

  
      if (signature !== expectedSignature) {


        let loggedError = await this.mongoInterface.WebhookErrorModel.create(
          {
           requestInput: req.rawBody, 
           errorMessage: "Invalid HMAC signature",
           createdAt: Date.now() ,
           type: undefined
          } 
       )

       await this.sendErrorEmail( loggedError )

        return  {
          success: false,
          error: 'invalid signature',
        }
      }


      return {success:true}

    }



    async storeAndBroadcastReceipt(receipt:WebhookReceipt){

      let createdRecord
      let sentEmail
      let loggedError 
  
      try {
        createdRecord = await this.mongoInterface.WebhookReceiptModel.create(
          receipt
        )
   
      } catch (error:any) {

        console.log('error',error)

        let loggedError = await this.mongoInterface.WebhookErrorModel.create(
           {
            requestInput: receipt, 
            errorMessage: error.message,
            createdAt: Date.now() ,
            type: receipt.type
           } 
        )

        await this.sendErrorEmail( loggedError )

         
      }
  
      try {
          
        if (shouldSendEmail) {

          let emailMessageText:string = createdRecord? `A ${receipt.type} webhook has been received with request_id: ${receipt.requestId}`: `A ${receipt.type} error has been logged with request_id: ${receipt.requestId}`

          sentEmail = await sendEmail(
            'Bloom API Alert',
            emailMessageText
          )
  
          console.log('sent email', sentEmail)
        }
      } catch (error) {
        console.error(error)
      }


      return {createdRecord, sentEmail}

    }


    receiveBNPLKYC: APICall = async (req: any, res: any) => {
      const inputParams = req.body

      let verifySignatureResult = await this.verifyHmacSignature(req)

      if(!verifySignatureResult.success){
        return res.status(401).send(verifySignatureResult)
      }


     

      const receipt: WebhookReceipt = {
        requestId: inputParams.requestId,
        user: inputParams.user,
        template: inputParams.template,
        profile: inputParams.profile,
        application: inputParams.application,
        createdAt: Date.now(),
        type:'BNPL_KYC'
      }
      
      let {createdRecord, sentEmail} = await this.storeAndBroadcastReceipt(receipt)

      
      return res.status(200).send({
        success: !!createdRecord,
      })
    }



    receiveBNPLLender: APICall = async (req: any, res: any) => {
      const inputParams = req.body

      let verifySignatureResult = await this.verifyHmacSignature(req)

      if(!verifySignatureResult.success){
        return res.status(401).send(verifySignatureResult)
      }

 

      const receipt: WebhookReceipt = {
        requestId: inputParams.requestId,
        user: inputParams.user,
        template: inputParams.template,
        profile: inputParams.profile,
        application: inputParams.application,
        createdAt: Date.now(),
        type:'BNPL_Lender'
      }
      
      let {createdRecord, sentEmail} = await this.storeAndBroadcastReceipt(receipt)

      
      return res.status(200).send({
        success: !!createdRecord,
      })
    }


    receiveMortgageBorrower: APICall = async (req: any, res: any) => {
      const inputParams = req.body

      let verifySignatureResult = await this.verifyHmacSignature(req)

      if(!verifySignatureResult.success){
        return res.status(401).send(verifySignatureResult)
      }


      
      const receipt: WebhookReceipt = {
        requestId: inputParams.requestId,
        user: inputParams.user,
        template: inputParams.template,
        profile: inputParams.profile,
        application: inputParams.application,
        createdAt: Date.now(),
        type:'Mortgage_Borrower'
      }
      
      let {createdRecord, sentEmail} = await this.storeAndBroadcastReceipt(receipt)

      
      return res.status(200).send({
        success: !!createdRecord,
      })
    }


    receiveMortgageLender: APICall = async (req: any, res: any) => {
      const inputParams = req.body

      let verifySignatureResult = await this.verifyHmacSignature(req)

      if(!verifySignatureResult.success){
        return res.status(401).send(verifySignatureResult)
      }

 

      const receipt: WebhookReceipt = {
        requestId: inputParams.requestId,
        user: inputParams.user,
        template: inputParams.template,
        profile: inputParams.profile,
        application: inputParams.application,
        createdAt: Date.now(),
        type:'Mortgage_Lender'
      }
      
      let {createdRecord, sentEmail} = await this.storeAndBroadcastReceipt(receipt)

      
      return res.status(200).send({
        success: !!createdRecord,
      })
    }


    
}
