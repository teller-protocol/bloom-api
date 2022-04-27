import { APICall } from 'mini-route-loader'

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

    verifyHmacSignature( req: any ){

 
      const signature = req.headers['x-onramp-signature']

      const expectedSignature = crypto
        .createHmac('sha256', process.env.ONRAMP_WEBHOOK_KEY)
        .update(req.rawBody)
        .digest('base64')
  
      if (signature !== expectedSignature) {
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
  
      try {
        createdRecord = await this.mongoInterface.WebhookReceiptModel.create(
          receipt
        )
   
      } catch (error) {
        console.error(error)
      }
  
      try {
        
  
        if (shouldSendEmail) {
          sentEmail = await sendEmail(
            'Bloom API Alert',
            `A ${receipt.type} webhook has been received with request_id: ${receipt.requestId}`
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

      let verifySignatureResult = this.verifyHmacSignature(req)

      if(!verifySignatureResult.success){
        return res.status(401).send(verifySignatureResult)
      }


      if(!inputParams.requestId){
        return res.status(200).send({
          success: false, error:'missing request id'
        })
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
        success: true,
      })
    }



    receiveBNPLLender: APICall = async (req: any, res: any) => {
      const inputParams = req.body

      let verifySignatureResult = this.verifyHmacSignature(req)

      if(!verifySignatureResult.success){
        return res.status(401).send(verifySignatureResult)
      }


      if(!inputParams.requestId){
        return res.status(200).send({
          success: false, error:'missing request id'
        })
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
        success: true,
      })
    }


    receiveMortgageBorrower: APICall = async (req: any, res: any) => {
      const inputParams = req.body

      let verifySignatureResult = this.verifyHmacSignature(req)

      if(!verifySignatureResult.success){
        return res.status(401).send(verifySignatureResult)
      }


      if(!inputParams.requestId){
        return res.status(200).send({
          success: false, error:'missing request id'
        })
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
        success: true,
      })
    }


    receiveMortgageLender: APICall = async (req: any, res: any) => {
      const inputParams = req.body

      let verifySignatureResult = this.verifyHmacSignature(req)

      if(!verifySignatureResult.success){
        return res.status(401).send(verifySignatureResult)
      }


      if(!inputParams.requestId){
        return res.status(200).send({
          success: false, error:'missing request id'
        })
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
        success: true,
      })
    }


    
}
