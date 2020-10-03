import Enmap from "enmap"
import * as entities from "../entities"

export interface LikeData {
  id: string
  user_id: string
  post_id: string
}

export class Like implements LikeData {
  static db = new Enmap<string, LikeData>({ name: "likes" })

  public id: string
  public user_id: string
  public post_id: string

  constructor(data: LikeData) {
    this.id = data.id
    this.user_id = data.user_id
    this.post_id = data.post_id
  }

  get data(): LikeData {
    return {
      id: this.id,
      user_id: this.user_id,
      post_id: this.post_id,
    }
  }

  static fromId(id: string): Like | void {
    const data = this.db.get(id)
    if (!data) return
    return new Like(data)
  }

  static find(finder: (data: LikeData) => boolean): Like | void {
    const data = this.db.find(finder)
    if (!data) return
    return new Like(data)
  }

  static filter(filter: (data: LikeData) => boolean): Like[] {
    return this.db.filterArray(filter).map((data) => new Like(data))
  }

  static add(data: LikeData) {
    this.db.set(data.id, data)
  }

  getUser(): entities.User | void {
    const user = entities.User.fromId(this.user_id)
    if (!user) return this.delete()
    return user
  }

  getPost(): entities.Post | void {
    const post = entities.Post.fromId(this.user_id)
    if (!post) return this.delete()
    return post
  }

  delete() {
    // todo
  }
}
