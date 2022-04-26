import axios from 'axios'
import chai, { expect } from 'chai'

import FileHelper from '../lib/file-helper'
import WebServer from '../server/server'

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
    })

    it('should return a response', async () => {
      const result = await axios.get(uriRoot + '/api/ping', {})

      expect(result.data.success).to.eql(true)
    })
  })
})
