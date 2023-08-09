import { Db, FindOptions, Filter, Document, UpdateFilter, MongoClient, MongoClientOptions } from "mongodb"

export default class DatabaseManager {
  private readonly uri: string;
  private readonly connectionOptions: MongoClientOptions;

  public db?: Db;
  constructor(uri: string, connectionOptions: MongoClientOptions) {
    this.uri = uri;
    this.connectionOptions = connectionOptions;
  }

  public async login() {
    if (this.uri && this.connectionOptions) {
      const connection = new MongoClient(this.uri, this.connectionOptions)

    connection.connect().then(() => {
       this.db = connection.db();
     })
    }
  }

  public async get(collectionName: string, filter: Filter<Document>, options: FindOptions={}) {
    const document = await this.db?.collection(collectionName).findOne(filter, options);
    return document;
  }

  public async getMultiple(collectionName: string, filter: Filter<Document>, options: FindOptions={}) {
    const documents = await this.db?.collection(collectionName).find(filter, options);
    return documents;
  }

  public async getWithFilter(collectionName: string, filter: Filter<Document>, filt: Document, options: FindOptions={}) {
    const documents = await this.db?.collection(collectionName).find(filter, options).filter(filt);
    return documents;
  }
  public async set(collectionName: string, filter: Filter<Document>, update: UpdateFilter<Document>) {
    await this.db?.collection(collectionName).findOneAndUpdate(filter, update, { upsert: true })
  }


  public async setMultiple() {

  }
}