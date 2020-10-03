import Enmap from "enmap"
import * as entities from "../entities"
import { LikeData } from "../entities"

export interface LinkData {
  id: string
  author_id: string
  target_id: string
}

export class Link implements LinkData {
  static db = new Enmap<string, LinkData>({ name: "links" })

  public id: string
  public author_id: string
  public target_id: string

  constructor(data: LinkData) {
    this.id = data.id
    this.author_id = data.author_id
    this.target_id = data.target_id
  }

  get data(): LinkData {
    return {
      id: this.id,
      author_id: this.author_id,
      target_id: this.target_id,
    }
  }

  static fromId(id: string): Link | undefined {
    const data = this.db.get(id)
    if (!data) return undefined
    return new Link(data)
  }

  static find(finder: (data: LinkData) => boolean): Link | void {
    const data = this.db.find(finder)
    if (!data) return
    return new Link(data)
  }

  static filter(filter: (data: LinkData) => boolean): Link[] {
    return this.db.filterArray(filter).map((data) => new Link(data))
  }

  static add(data: LinkData) {
    this.db.set(data.id, data)
  }

  getAuthor(): entities.User | void {
    const user = entities.User.fromId(this.author_id)
    if (!user) return this.delete()
    return user
  }

  getTarget(): entities.User | void {
    const user = entities.User.fromId(this.target_id)
    if (!user) return this.delete()
    return user
  }

  delete() {
    // todo
  }
}
