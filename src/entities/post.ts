import Enmap from "enmap"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import * as entities from "../entities"
import * as utils from "../utils"

dayjs.extend(relativeTime)

export interface PostData extends utils.Dated {
  id: string
  author_id: string
  parent_id: string | null
  content: string
}

export class Post implements PostData {
  static db = new Enmap<string, PostData>({ name: "posts" })

  public id: string
  public author_id: string
  public parent_id: string | null
  public content: string
  public date: number

  constructor(data: PostData) {
    this.id = data.id
    this.author_id = data.author_id
    this.parent_id = data.parent_id ?? null
    this.content = data.content
    this.date = data.date
  }

  get data(): PostData {
    return {
      id: this.id,
      author_id: this.author_id,
      parent_id: this.parent_id,
      content: this.content,
      date: this.date,
    }
  }

  get since(): string {
    return dayjs(this.date).fromNow()
  }

  static fromId(id: string | null): Post | undefined {
    if (!id) return undefined
    const data = this.db.get(id)
    if (!data) return undefined
    return new Post(data)
  }

  static find(finder: (data: PostData) => boolean): Post | void {
    const data = this.db.find(finder)
    if (!data) return
    return new Post(data)
  }

  static filter(filter: (data: PostData) => boolean): Post[] {
    return this.db.filterArray(filter).map((data) => new Post(data))
  }

  static add(data: PostData) {
    this.db.set(data.id, data)
  }

  getAuthor(): entities.User | void {
    const user = entities.User.fromId(this.author_id)
    if (!user) return this.delete()
    return user
  }

  getParent(): Post | void {
    if (!this.parent_id) return
    const post = Post.fromId(this.parent_id)
    if (!post) return this.delete()
    return post
  }

  getFormattedContent(): string {
    const mentions = this.getMentions()
    let formattedContent = utils.md.render(this.content)
    for (const user of mentions) {
      formattedContent = formattedContent.replace(
        new RegExp(`(@${user.username})\\b`, "g"),
        `<a href='/wall/${user.id}' class="decoration-none">$1</a>`
      )
    }
    return formattedContent
  }

  getLikes(): entities.Like[] {
    return entities.Like.db
      .filterArray((data) => data.post_id === this.id)
      .map((data) => new entities.Like(data))
  }

  getChildren(): Post[] {
    return Post.db
      .filterArray((data) => !!data.parent_id && data.parent_id === this.id)
      .map((data) => new Post(data))
      .sort(utils.sortByDate)
  }

  getAllChildren(): Post[] {
    return this.getChildren()
      .map((child) => [child, ...child.getAllChildren()])
      .flat()
  }

  getPath(): Post[] {
    const path: Post[] = []
    let current: Post | void = this
    while (current) {
      path.push(current)
      current = current.getParent()
    }
    return path.reverse()
  }

  getMentions(): entities.User[] {
    return utils
      .removeDuplicate(
        entities.User.db
          .filterArray((data) => {
            const regex = new RegExp(`(@${data.username})\\b`)
            return regex.test(this.content)
          })
          .map((data) => data.id)
      )
      .map((id) => entities.User.fromId(id) as entities.User)
  }

  delete() {
    this.getLikes().forEach((like) => like.delete())
    this.getChildren().forEach((child) => child.delete())
    Post.db.delete(this.id)
  }
}
