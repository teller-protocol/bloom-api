import axios from 'axios'
import chai, { expect } from 'chai'

import AppHelper from '../lib/app-helper'
import FileHelper from '../lib/file-helper'
import ApiController from '../server/controllers/api-controller'
import WebServer from '../server/server'

import MongoDatabaseStub from './lib/mongo-database-stub'

const crypto = require('crypto')

const serverConfig = { port: 4040 }

const uriRoot = `http://localhost:${serverConfig.port}`

let webServer: WebServer

describe('Webhook Server', () => {
  describe('Recieve webhook', () => {
    before(async () => {
      //boot web server

      const mongoDatabase = new MongoDatabaseStub()

      const apiController = new ApiController(mongoDatabase)

      webServer = new WebServer()
      await webServer.start(apiController, serverConfig)

      // await webServer.mongoInterface.dropDatabase()
    })

    after(async () => {
      await webServer.stop( )
    })

    it('should return a ping response', async () => {
      const result = await axios.get(uriRoot + '/api/ping', {})

      expect(result.data.success).to.eql(true)
    })

    it('should fail a webhook with wrong key', async () => {
      const inputParams = { requestId: 'testId' }

      const rawBody = JSON.stringify(inputParams)

      const hmacSignature = crypto
        .createHmac('sha256', 'invalid_key')
        .update(rawBody) // This has to be the raw Buffer body of the request not the parsed JSON
        .digest('base64')

      const headers = {
        headers: {
          'x-onramp-signature': hmacSignature,
          'content-type': 'text/json',
        },
      }

      const result = await axios
        .post(uriRoot + '/api/bnpl-kyc/webhook', inputParams, headers)
        .then((res) => {
          throw new Error('webhook was supposed to fail')
        })
        .catch((err) => {
          expect(err.response.status).to.eql(401)
        })

      /*const loggedError: any =
        await mongoDatabase.WebhookErrorModel.findOne({}).sort({
          createdAt: -1,
        })

      console.log('loggedError', loggedError)

      expect(loggedError.errorMessage).to.eql('Invalid HMAC signature')*/
    })

    it('should accept a webhook', async () => {
      const inputParams = { requestId: 'testId' }

      const rawBody = JSON.stringify(inputParams)

      const hmacSignature = crypto
        .createHmac('sha256', process.env.ONRAMP_WEBHOOK_KEY)
        .update(rawBody) // This has to be the raw Buffer body of the request not the parsed JSON
        .digest('base64')

      const headers = {
        headers: {
          'x-onramp-signature': hmacSignature,
          'content-type': 'text/json',
        },
      }

      const result = await axios.post(
        uriRoot + '/api/bnpl-kyc/webhook',
        inputParams,
        headers
      )

      expect(result.data.success).to.eql(true)
    })

      
    /*
    it.skip('should log an error', async () => {
      const inputParams = { requestId: undefined, application: 'Apps' }

      const rawBody = JSON.stringify(inputParams)

      const hmacSignature = crypto
        .createHmac('sha256', process.env.ONRAMP_WEBHOOK_KEY)
        .update(rawBody) // This has to be the raw Buffer body of the request not the parsed JSON
        .digest('base64')

      const headers = {
        headers: {
          'x-onramp-signature': hmacSignature,
          'content-type': 'text/json',
        },
      }

      const result = await axios.post(
        uriRoot + '/api/bnpl-kyc/webhook',
        inputParams,
        headers
      )

      expect(result.data.success).to.eql(false)

     
    })*/



     /*const loggedError: any =
        await mongoDatabase.WebhookErrorModel.findOne({}).sort({
          createdAt: -1,
        })

      console.log('loggedError', loggedError)

      expect(loggedError.errorMessage).to.eql(
        'webhookreceipts validation failed: requestId: Path `requestId` is required.'
      )*/



  })
})
