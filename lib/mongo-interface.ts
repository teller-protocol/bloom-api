import {
  Mongoose,
  Schema,
} from 'mongoose'

export interface WebhookReceipt {
  requestId: string
  user: any,
  template: any,
  profile: any,
  application:any,
  createdAt: number
}

export default class MongoInterface {
  mongoose = new Mongoose()

  WebhookReceiptSchema = new Schema<WebhookReceipt>({
    requestId: { type: String, index: true, unique: true },
    user: Object,
    template: Object,
    profile: Object,
    application: Object,
    createdAt: Number,
  })

  WebhookReceiptModel = this.mongoose.model<WebhookReceipt>(
    'webhookreceipts',
    this.WebhookReceiptSchema
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
