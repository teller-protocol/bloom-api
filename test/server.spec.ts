import axios from 'axios'
import chai, { expect } from 'chai'

import FileHelper from '../lib/file-helper'
import WebServer from '../server/server'

const crypto = require('crypto');

const serverConfig = FileHelper.readJSONFile(
  './server/config/serverConfig.json'
)

const uriRoot = 'http://localhost:8000'

describe('Webhook Server', () => {
  describe('Recieve webhook', () => {
    before(async () => {
      //boot web server

      const webServer = new WebServer()
      await webServer.start(serverConfig)

      await webServer.mongoInterface.dropDatabase()
    })

    it('should return a ping response', async () => {
      const result = await axios.get(uriRoot + '/api/ping', {})

      expect(result.data.success).to.eql(true)
    })

    it('should fail a webhook with wrong key', async () => {


      let inputParams = {requestId:'testId'}

      let rawBody = JSON.stringify(inputParams)


      let hmacSignature = crypto
      .createHmac('sha256', 'invalid_key')          
      .update(rawBody)// This has to be the raw Buffer body of the request not the parsed JSON
      .digest('base64')

      let headers ={
        headers: {
          'x-onramp-signature': hmacSignature,
          'content-type': 'text/json'
        }
      }

      const result = axios.post(uriRoot + '/api/webhook', inputParams, headers).then((res)=>{ 
        throw 'webhook was supposed to fail'
      }).catch((err)=>{ 
        expect(err.response.status).to.eql(401)
      })
 
    })


    it('should accept a webhook', async () => {


      let inputParams = {requestId:'testId'}

      let rawBody = JSON.stringify(inputParams)
        
      let hmacSignature = crypto
      .createHmac('sha256', process.env.ONRAMP_WEBHOOK_KEY)
      .update(rawBody)// This has to be the raw Buffer body of the request not the parsed JSON
      .digest('base64')

      let headers ={
        headers: {
          'x-onramp-signature': hmacSignature,
          'content-type': 'text/json'
        }
      }

      const result = await axios.post(uriRoot + '/api/webhook', inputParams, headers)

      expect(result.data.success).to.eql(true)
    })
  })
})
