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

const routes = FileHelper.readJSONFile('./server/config/routes.json')

 
export default class WebServer {
  server: https.Server | http.Server | undefined

  async start(serverConfig: any): Promise<void> {
     

    const dbName = AppHelper.getDbName()

    const mongoInterface = new MongoInterface()
    await mongoInterface.init(dbName) 
   

    const apiController = new ApiController(mongoInterface)

    const app = express()
    const apiPort = serverConfig.port ? serverConfig.port : 3000

    app.use(cors())
    app.use(express.json())

    if (serverConfig.useHTTPS == true) {
      this.server = https.createServer({
        cert: fs.readFileSync('/home/andy/deploy/cert/starflask.com.pem'),
        key: fs.readFileSync('/home/andy/deploy/cert/starflask.com.key'),
      })
      console.log('--using https--')
    } else {
      this.server = http.createServer(app)
    }

    MiniRouteLoader.loadRoutes(app, routes, apiController)

    app.listen(apiPort, () => {
      console.log(`API Server listening at http://localhost:${apiPort}`)
    })
  }
}
