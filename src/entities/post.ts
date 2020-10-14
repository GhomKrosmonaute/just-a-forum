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

  static sort(
    sorter: (d1: PostData, d2: PostData) => number,
    limit?: number
  ): Post[] {
    const sorted = this.db.array().sort(sorter)
    const data = limit ? sorted.slice(0, limit) : sorted
    return data.map((d) => new Post(d))
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
    let cache = formattedContent

    const parent = this.getParent()

    if (parent) {
      const you = parent.getAuthor()
      if (you) {
        while (cache.includes("@you")) {
          cache = cache.replace("@you", "")
          formattedContent = formattedContent.replace(
            "@you",
            you.getHTMLAnchor()
          )
        }
      }
    }

    const me = this.getAuthor()

    if (me) {
      while (cache.includes("@me")) {
        cache = cache.replace("@me", "")
        formattedContent = formattedContent.replace("@me", me.getHTMLAnchor())
      }
    }

    for (const user of mentions) {
      const mention = "@" + user.username
      while (cache.includes(mention)) {
        cache = cache.replace(mention, "")
        formattedContent = formattedContent.replace(
          mention,
          user.getHTMLAnchor()
        )
      }
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

  getChildrenPagination(pageIndex: number): utils.Pagination<Post> {
    return utils.paginate(this.getChildren(), pageIndex)
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
    const shortcuts: string[] = []

    if (this.content.includes("@you")) {
      const parent = this.getParent()
      if (parent) {
        shortcuts.push(parent.author_id)
      }
    }

    if (this.content.includes("@me")) {
      shortcuts.push(this.author_id)
    }

    return utils
      .removeDuplicate(
        entities.User.db
          .filterArray((data) => {
            return this.content.includes("@" + data.username)
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
