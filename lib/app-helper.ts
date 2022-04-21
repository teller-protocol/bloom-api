import fs from 'fs'
import path from 'path'

require('dotenv').config()

const NODE_ENV = process.env.NODE_ENV

import { Provider } from '@ethersproject/providers'
import { Wallet } from 'ethers'
import hre from 'hardhat'
import web3utils from 'web3-utils'

import { getMnemonic } from '../hardhat.config'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class AppHelper {
  static getEnvironmentName(): string {
    const envName = NODE_ENV ? NODE_ENV : 'development'

    return envName
  }

  static getDbName(): string {
    return 'bloom_api_'.concat(AppHelper.getEnvironmentName())
  } 

  static toChecksumAddress(address: string): string {
    return web3utils.toChecksumAddress(address)
  }

  static escapeString(input: string): string {
    return encodeURI(input)
  }

  static unescapeString(input: string): string {
    return decodeURI(input)
  }
}
