import Enmap from "enmap"
import * as entities from "../entities"
import * as utils from "../utils"

export interface UserData {
  id: string
  username: string
  password: string
}

export class User implements UserData {
  static db = new Enmap<string, UserData>({ name: "users" })

  public admin = false
  public id: string
  public username: string
  public password: string

  constructor(data: UserData) {
    this.id = data.id
    this.username = data.username
    this.password = data.password
  }

  get data(): UserData {
    return {
      id: this.id,
      username: this.username,
      password: this.password,
    }
  }

  static fromId(id: string): User | void {
    const data = this.db.get(id)
    if (!data) return
    return new User(data)
  }

  static find(finder: (data: UserData) => boolean): User | void {
    const data = this.db.find(finder)
    if (!data) return
    return new User(data)
  }

  static filter(filter: (data: UserData) => boolean): User[] {
    return this.db.filterArray(filter).map((data) => new User(data))
  }

  static add(data: UserData) {
    this.db.set(data.id, data)
  }

  isFriendWith(user: User): boolean {
    const links = this.getLinks()
    const userLinks = user.getLinks()
    return links.some((link) => {
      return userLinks.some((userLink) => {
        return (
          link.target_id === userLink.author_id &&
          link.author_id === userLink.target_id
        )
      })
    })
  }

  getWall(): entities.Post[] {
    return this.getPosts()
      .concat(
        this.getFriends()
          .map((user) => user.getPosts())
          .flat()
      )
      .sort(utils.sortByDate)
  }

  getPosts(): entities.Post[] {
    return entities.Post.db
      .filterArray((data) => data.author_id === this.id && !data.parent_id)
      .map((data) => new entities.Post(data))
  }

  getNetwork(): User[] {
    const friends = this.getFriends()
    return utils.removeDuplicate(
      User.db
        .filterArray(
          (data) => data.id !== this.id && friends.some((f) => f.id === data.id)
        )
        .map((data) =>
          new User(data).getFriends().filter((f) => f.id !== this.id)
        )
        .flat()
    )
  }

  getFriends(): User[] {
    return User.db
      .filterArray((data) => {
        const user = User.fromId(data.id)
        if (!user) return false
        return this.isFriendWith(user)
      })
      .map((data) => new User(data))
  }

  getLikes(): entities.Like[] {
    return entities.Like.db
      .filterArray((data) => data.user_id === this.id)
      .map((data) => new entities.Like(data))
  }

  getLinks(): entities.Link[] {
    return entities.Link.db
      .filterArray((data) => data.author_id === this.id)
      .map((data) => new entities.Link(data))
  }

  getPending(): User[] {
    return entities.Link.db
      .filterArray((data) => {
        if (data.author_id !== this.id) return false
        const user = User.fromId(data.target_id)
        if (!user || this.isFriendWith(user)) return false
        return true
      })
      .map((data) => User.fromId(data.target_id) as User)
  }

  getRequests(): User[] {
    return entities.Link.db
      .filterArray((data) => {
        if (data.target_id !== this.id) return false
        const user = User.fromId(data.author_id)
        if (!user || this.isFriendWith(user)) return false
        return true
      })
      .map((data) => User.fromId(data.author_id) as User)
  }

  delete() {
    entities.Link.forEach((link) => {
      if (link.target_id === this.id || link.author_id === this.id) {
        link.delete()
      }
    })
    this.getLikes().forEach((like) => like.delete())
    this.getPosts().forEach((post) => post.delete())
    User.db.delete(this.id)
  }
}
