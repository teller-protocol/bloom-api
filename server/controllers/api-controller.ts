import MailSender from 'lib/mail-sender'
import { APICall } from 'mini-route-loader'

import AppHelper from '../../lib/app-helper'
 
import MongoInterface, { WebhookReceipt } from '../../lib/mongo-interface'

export default class ApiController {
  constructor(
    public mailSender: MailSender,
    public mongoInterface: MongoInterface
  ) {}

  ping: APICall = async (req: any, res: any) => {
    return res.status(200).send({ success: true })
  }

  /*
    @notice Generates an attestation using the pre-initialized eip712SDK

    @param recipientAddress The public address of the account to attest to be verified for MarketRegistry
    @param authToken The authentication token that proves that you are authorized to make this API call. Must exist in the mongo database. 

  */
  receiveWebhook: APICall = async (req: any, res: any) => {


    console.log('received webhook',req )


    const inputParams = req.body

    const inputs = {
      requestId: inputParams.requestId,
      user: inputParams.user,
      template: inputParams.template,
      profile: inputParams.profile,
      application: inputParams.application
    }

    let receipt:WebhookReceipt = {
      requestId: inputs.requestId,
      user:inputs.user,
      template:inputs.template,
      profile:inputs.profile,
      application:inputs.application,
      createdAt: Date.now()
    }

    try{

      let created = await this.mongoInterface.WebhookReceiptModel.create(receipt)   
      
      console.log('inserted',created )

      let sent = this.mailSender.sendEmail('Bloom API Alert','A webhook has been received with Request Id '.concat(inputs.requestId))


      return res.status(200).send({
        success: true 
      })

    }catch(error){
      console.error(error)
    }
    
    return res.status(200).send({
      success: false 
    })
  }
}
