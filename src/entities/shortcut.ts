import * as database from "../database"
import * as entities from "../entities"

type ShortcutData = database.TableData["shortcut"]

export class Shortcut implements ShortcutData {
  static db = new database.Database("shortcut")

  public db = Shortcut.db

  public id: number
  public user_id: number
  public input: string
  public output: string
  public created_timestamp: number

  constructor(data: ShortcutData) {
    this.id = data.id
    this.user_id = data.user_id
    this.input = data.input
    this.output = data.output
    this.created_timestamp = data.created_timestamp
  }

  get data(): ShortcutData {
    return {
      id: this.id,
      user_id: this.user_id,
      input: this.input,
      output: this.output,
      created_timestamp: this.created_timestamp,
    }
  }

  static async fromId(id: number): Promise<Shortcut | void> {
    const data = await this.db.get(id)
    if (!data) return
    return new Shortcut(data)
  }

  static async find(filter: string, values?: any): Promise<Shortcut | void> {
    const data = await this.db.find(filter, values)
    if (!data) return
    return new Shortcut(data)
  }

  static async all(
    pagination?: database.PaginationOptions
  ): Promise<Shortcut[]> {
    return this.db
      .all(pagination)
      .then((results) => results.map((data) => new Shortcut(data)))
  }

  static async filter(
    filter: string,
    values?: any,
    pagination?: database.PaginationOptions
  ): Promise<Shortcut[]> {
    return this.db
      .filter(filter, values, pagination)
      .then((results) => results.map((data) => new Shortcut(data)))
  }

  async getUser(): Promise<entities.User | void> {
    const user = await entities.User.fromId(this.user_id)
    if (!user) return this.delete()
    return user
  }

  delete() {
    return this.db.delete(this.id)
  }

  async patch(data: ShortcutData) {
    if (data.id !== this.id) {
      throw new Error("oops")
    }
    data.user_id = this.user_id
    this.output = data.output
    this.input = data.input
    await Shortcut.db.patch(data)
  }
}
