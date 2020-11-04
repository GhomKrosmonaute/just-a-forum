import * as entities from "../entities"
import * as database from "../database"

type FriendRequestData = database.TableData["friend_request"]

export class FriendRequest implements FriendRequestData {
  static db = new database.Database("friend_request")

  public db = FriendRequest.db

  public id: number
  public author_id: number
  public target_id: number
  public created_timestamp: number

  constructor(data: FriendRequestData) {
    this.id = data.id
    this.author_id = data.author_id
    this.target_id = data.target_id
    this.created_timestamp = data.created_timestamp
  }

  get data(): FriendRequestData {
    return {
      id: this.id,
      author_id: this.author_id,
      target_id: this.target_id,
      created_timestamp: this.created_timestamp,
    }
  }

  static async fromId(id: number): Promise<FriendRequest | undefined> {
    const data = await this.db.get(id)
    if (!data) return undefined
    return new FriendRequest(data)
  }

  static async find(
    filter: string,
    values?: any
  ): Promise<FriendRequest | void> {
    const data = await this.db.find(filter, values)
    if (!data) return
    return new FriendRequest(data)
  }

  static async filter(filter: string, values?: any): Promise<FriendRequest[]> {
    return this.db
      .filter(filter, values)
      .then((results) => results.map((data) => new FriendRequest(data)))
  }

  static add(data: FriendRequestData) {
    return this.db.push(data)
  }

  async getAuthor(): Promise<entities.User | void> {
    const user = await entities.User.fromId(this.author_id)
    if (!user) return this.delete()
    return user
  }

  async getTarget(): Promise<entities.User | void> {
    const user = await entities.User.fromId(this.target_id)
    if (!user) return this.delete()
    return user
  }

  async delete() {
    await this.db.delete(this.id)
  }
}
