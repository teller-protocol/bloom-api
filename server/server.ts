import fs from 'fs'
import http from 'http'
import https from 'https'
import path from 'path'

import cors from 'cors'
import express from 'express'
import MiniRouteLoader from 'mini-route-loader'

import AppHelper from '../lib/app-helper'
import FileHelper from '../lib/file-helper'
import MongoInterface from '../lib/mongo-interface'

import ApiController from './controllers/api-controller'

require('dotenv').config()
const bodyParser = require('body-parser')


const routes = FileHelper.readJSONFile('./server/config/routes.json')

export default class WebServer {
  server: https.Server | http.Server | undefined
  mongoInterface: MongoInterface = new MongoInterface()


  async start(serverConfig: any): Promise<void> {
    const dbName = AppHelper.getDbName()
 
    await this.mongoInterface.init(dbName)

    const apiController = new ApiController(this.mongoInterface)

    const app = express()
    const apiPort = serverConfig.port ? serverConfig.port : 3000

    app.use(cors())
    //app.use(express.json())

    app.use(
      bodyParser.json({
        type: '*/*',
        verify: (req:any, res:any, buf: Buffer) => {
           req.rawBody = buf
           return true
        },
        limit: '10mb', // https://stackoverflow.com/a/19965089/1165441
      })
    )


    this.server = http.createServer(app)

    MiniRouteLoader.loadRoutes(app, routes, apiController)

    app.listen(apiPort, () => {
      console.log(`API Server listening at http://localhost:${apiPort}`)
    })
  }
}
