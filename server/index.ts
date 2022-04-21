import FileHelper from '../lib/file-helper'

import WebServer from './server'

const serverConfig = FileHelper.readJSONFile(
  './server/config/serverConfig.json'
)

async function init(): Promise<void> {
  const webServer = new WebServer()
  await webServer.start(serverConfig)
}

void init()
