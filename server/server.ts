import fs from 'fs'
import http from 'http'
import https from 'https'
import path from 'path'

import cors from 'cors'
import express from 'express'
import MiniRouteLoader from 'mini-route-loader'

import AppHelper from '../lib/app-helper'
import FileHelper from '../lib/file-helper'
//import MongoInterface from '../lib/mongo-database'

import ApiController from './controllers/api-controller'

require('dotenv').config()
const bodyParser = require('body-parser')

const routes = FileHelper.readJSONFile('./server/config/routes.json')

export default class WebServer {
  server: https.Server | http.Server | undefined
 
  async start(apiController: ApiController, serverConfig: any): Promise<void> {
   
    const app = express()
    const apiPort = serverConfig.port ? serverConfig.port : 3000

    app.use(cors())

    /*
    Required by Bloom API for accepting webhook data properly 
    */
    app.use(
      bodyParser.json({
        type: '*/*',
        verify: (req: any, res: any, buf: Buffer) => {
          req.rawBody = buf
          return true
        },
        limit: '10mb', // https://stackoverflow.com/a/19965089/1165441
      })
    )


    if(!process.env.ONRAMP_WEBHOOK_KEY ){
      throw(new Error('Missing Webhook Key'))
    }

    this.server = http.createServer(app)

    MiniRouteLoader.loadRoutes(app, routes, apiController)

    app.listen(apiPort, () => {
      console.log(`API Server listening at http://localhost:${apiPort}`)
    })
  }
}
