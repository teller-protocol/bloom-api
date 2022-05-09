import AppHelper from '../lib/app-helper'
import FileHelper from '../lib/file-helper'
import MongoDatabase from '../lib/mongo-database'

import ApiController from './controllers/api-controller'
import WebServer from './server'

const serverConfig = FileHelper.readJSONFile(
  './server/config/serverConfig.json'
)

async function init(): Promise<void> {
  const webServer = new WebServer()

  const dbName = AppHelper.getDbName()

  const mongoDatabase = new MongoDatabase()

  await mongoDatabase.init(dbName)

  const apiController = new ApiController(mongoDatabase)

  await webServer.start(apiController, serverConfig)
}

void init()
