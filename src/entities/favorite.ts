import * as database from "../database"
import * as entities from "../entities"

type FavoriteData = database.TableData["favorite"]

export class Favorite implements FavoriteData {
  static db = new database.Database("favorite")

  public db = Favorite.db

  public id: number
  public user_id: number
  public post_id: number
  public created_timestamp: number

  constructor(data: FavoriteData) {
    this.id = data.id
    this.user_id = data.user_id
    this.post_id = data.post_id
    this.created_timestamp = data.created_timestamp
  }

  get data(): FavoriteData {
    return {
      id: this.id,
      user_id: this.user_id,
      post_id: this.post_id,
      created_timestamp: this.created_timestamp,
    }
  }

  static async fromId(id: number): Promise<Favorite | void> {
    const data = await this.db.get(id)
    if (!data) return
    return new Favorite(data)
  }

  static async find(filter: string, values?: any): Promise<Favorite | void> {
    const data = await this.db.find(filter, values)
    if (!data) return
    return new Favorite(data)
  }

  static async filter(filter: string, values?: any): Promise<Favorite[]> {
    return this.db
      .filter(filter, values)
      .then((results) => results.map((data) => new Favorite(data)))
  }

  async getUser(): Promise<entities.User | void> {
    const user = await entities.User.fromId(this.user_id)
    if (!user) return this.delete()
    return user
  }

  async getPost(): Promise<entities.Post | void> {
    const post = await entities.Post.fromId(this.post_id)
    if (!post) return this.delete()
    return post
  }

  async delete() {
    await this.db.delete(this.id)
  }
}
