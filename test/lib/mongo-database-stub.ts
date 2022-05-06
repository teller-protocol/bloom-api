import { MongoDatabaseInterface, WebhookError, WebhookReceipt } from 'lib/mongo-database'
import { AnyKeys, FilterQuery, Schema, UpdateQuery } from 'mongoose'


class StubbedModel {
  dataStore: any[]

  constructor(public tableName: string, public schema: Schema) {
    this.dataStore = []
  }

  async create(inputData: any): Promise<any> {
    this.dataStore.push(inputData)

    return inputData
  }

  async insertMany(inputs: any[]): Promise<any> {
    inputs.map((i) => this.create(i))
  }

  async find(filter: any): Promise<any[]> {
    const keys = Object.keys(filter)
    const values = Object.values(filter)

    return this.dataStore.filter((element) => {
      //we make sure all the keys match up properly

      for (let i = 0; i < keys.length; i++) {
        if (element[keys[i]] != values[i]) {
          return false
        }
      }

      return true
    })
  }

  async findOne(filter: any): Promise<any> {
    const allResults = await this.find(filter)

    if (allResults && allResults.length > 0) {
      return allResults[0]
    }

    return undefined
  }
}

export default class MongoDatabaseStub implements MongoDatabaseInterface {
  
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


  WebhookReceiptModel = new StubbedModel('webhookerrors', this.WebhookReceiptSchema)

 
  WebhookErrorModel = new StubbedModel('webhookreceipts', this.WebhookErrorSchema)


  async init(dbName: string, config?: any): Promise<void> {
    const host: string = config?.url ?? 'localhost'
    const port: number = config?.port ?? 27017

    if (dbName == null) {
      console.log('WARNING: No dbName Specified')
      process.exit()
    }

    const url = 'mongodb://' + host + ':' + port.toString() + '/' + dbName
    //await this.mongoose.connect(url, {})
    console.log('connected to ', url, dbName)
  }

  async dropDatabase(): Promise<void> {}
}
