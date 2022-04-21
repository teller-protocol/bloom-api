import {
  AnyKeys,
  connect,
  FilterQuery,
  Mongoose,
  Schema,
  UpdateQuery,
} from 'mongoose'

export interface AuthToken {
  token: { type: string; index: true; unique: true }
  createdAt: number
}

export default class MongoInterface {
  mongoose = new Mongoose()

  AuthTokenSchema = new Schema<AuthToken>({
    token: { type: String, index: true, unique: true },
    createdAt: { type: Number },
  })

  AuthTokenModel = this.mongoose.model<AuthToken>(
    'authtokens',
    this.AuthTokenSchema
  )

  async init(dbName: string, config?: any): Promise<void> {
    const host: string = config?.url ?? 'localhost'
    const port: number = config?.port ?? 27017

    if (dbName == null) {
      console.log('WARNING: No dbName Specified')
      process.exit()
    }

    const url = 'mongodb://' + host + ':' + port.toString() + '/' + dbName
    await this.mongoose.connect(url, {})
    console.log('connected to ', url, dbName)
  }

  async dropDatabase(): Promise<void> {
    await this.mongoose.connection.db.dropDatabase()
  }
}
