import { APICall } from 'mini-route-loader'

import AppHelper from '../../lib/app-helper'
 
import MongoInterface from '../../lib/mongo-interface'

export default class ApiController {
  constructor(
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
      recipientAddress: inputParams.recipientAddress,
      authToken: inputParams.authToken,
    }



    
    return res.status(200).send({
      success: true 
    })
  }
}
