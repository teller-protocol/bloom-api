import { Mongoose, Schema } from 'mongoose'

export interface WebhookError {
  requestInput: any
  errorMessage: any
  createdAt: number
  type: string
}

export interface WebhookReceipt {
  requestId: string
  user: any
  template: any
  profile: any
  application: any
  createdAt: number
  type: string
}

export default class MongoInterface {
  mongoose = new Mongoose()

  WebhookErrorSchema = new Schema<WebhookError>({
    requestInput: Object,
    errorMessage: Object,
    createdAt: Number,
    type: String,
  })

  WebhookReceiptSchema = new Schema<WebhookReceipt>({
    requestId: { type: String, index: true, unique: true, required: true },
    user: Object,
    template: Object,
    profile: Object,
    application: Object,
    createdAt: Number,
    type: String,
  })

  WebhookReceiptModel = this.mongoose.model<WebhookReceipt>(
    'webhookreceipts',
    this.WebhookReceiptSchema
  )

  WebhookErrorModel = this.mongoose.model<WebhookError>(
    'webhookerrors',
    this.WebhookErrorSchema
  )

  async init(dbName: string, config?: any): Promise<void> {
    const host: string = config?.url ?? 'localhost'
    const port: number = config?.port ?? 27017

    if (dbName == null) {
      console.log('WARNING: No dbName specified')
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
