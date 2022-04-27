import { APICall } from 'mini-route-loader'

import AppHelper from '../../lib/app-helper'
import { sendEmail } from '../../lib/mail-sender'
import MongoInterface, { WebhookReceipt } from '../../lib/mongo-interface'

const crypto = require('crypto')

export default class ApiController {
  constructor(public mongoInterface: MongoInterface) {}

  ping: APICall = async (req: any, res: any) => {
    return res.status(200).send({ success: true })
  }

  /*
    @notice Accepts a webhook call from Bloom API 
 
  */
  receiveWebhook: APICall = async (req: any, res: any) => {
    const inputParams = req.body

    const signature = req.headers['x-onramp-signature']

    const expectedSignature = crypto
      .createHmac('sha256', process.env.ONRAMP_WEBHOOK_KEY)
      .update(req.rawBody)
      .digest('base64')

    if (signature !== expectedSignature) {
      return res.status(401).send({
        success: false,
        error: 'invalid signature',
      })
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
      const shouldSendEmail = AppHelper.getEnvironmentName() == 'production'

      if (shouldSendEmail) {
        sentEmail = await sendEmail(
          'Bloom API Alert',
          `A webhook has been received with request_id: ${inputParams.requestId}`
        )

        console.log('sent email', sentEmail)
      }
    } catch (error) {
      console.error(error)
    }

    return res.status(200).send({
      success: true,
    })
  }
}
