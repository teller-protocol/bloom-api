import { APICall } from 'mini-route-loader'

import AppHelper from '../../lib/app-helper'
import { sendEmail } from '../../lib/mail-sender'
import MongoInterface, { WebhookReceipt } from '../../lib/mongo-interface'

const crypto = require('crypto');

export default class ApiController {
  constructor(public mongoInterface: MongoInterface) {}

  ping: APICall = async (req: any, res: any) => {
    return res.status(200).send({ success: true })
  }

  /*
    @notice Accepts a webhook call from Bloom API 
 
  */
  receiveWebhook: APICall = async (req: any, res: any) => {
    console.log('received webhook', req)

    const inputParams = req.body


    const signature = req.headers['x-onramp-signature']

    const expectedSignature = crypto
          .createHmac('sha256', process.env.ONRAMP_WEBHOOK_KEY)          
          .update(req.body)// This has to be the raw Buffer body of the request not the parsed JSON
          .digest('base64')

    if (signature !== expectedSignature) return res.status(401).send({
      success: false, error:'invalid signature'
    })


    const inputs = {
      requestId: inputParams.requestId,
      user: inputParams.user,
      template: inputParams.template,
      profile: inputParams.profile,
      application: inputParams.application,
    }

    const receipt: WebhookReceipt = {
      requestId: inputs.requestId,
      user: inputs.user,
      template: inputs.template,
      profile: inputs.profile,
      application: inputs.application,
      createdAt: Date.now(),
    }

    let createdRecord
    let sentEmail

    try {
      createdRecord = await this.mongoInterface.WebhookReceiptModel.create(
        receipt
      )

      console.log('inserted', createdRecord)
    } catch (error) {
      console.error(error)
    }

    try {
      sentEmail = await sendEmail(
        'Bloom API Alert',
        'A webhook has been received with request_id '.concat(inputs.requestId)
      )

      console.log('sent email', sentEmail)
    } catch (error) {
      console.error(error)
    }

    return res.status(200).send({
      success: true,
    })
  }
}
