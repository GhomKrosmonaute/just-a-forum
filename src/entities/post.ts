import * as database from "../database"
import * as entities from "../entities"
import * as utils from "../utils"

type PostData = database.TableData["post"]

export class Post implements PostData {
  static db = new database.Database("post")

  public db = Post.db

  public id: number
  public author_id: number
  public parent_id: number | null
  public content: string
  public edited_timestamp: number | null
  public created_timestamp: number

  constructor(data: PostData) {
    this.id = data.id
    this.author_id = data.author_id
    this.parent_id = data.parent_id ?? null
    this.content = data.content
    this.edited_timestamp = data.edited_timestamp ?? null
    this.created_timestamp = data.created_timestamp
  }

  get data(): PostData {
    return {
      id: this.id,
      author_id: this.author_id,
      parent_id: this.parent_id,
      content: this.content,
      edited_timestamp: this.edited_timestamp,
      created_timestamp: this.created_timestamp,
    }
  }

  get since(): string {
    return utils.dayjs(this.created_timestamp).fromNow()
  }

  static async fromId(id: number | null): Promise<Post | void> {
    if (!id) return
    const data = await this.db.get(id)
    if (!data) return undefined
    return new Post(data)
  }

  static async find(filter: string, values?: any): Promise<Post | void> {
    const data = await this.db.find(filter, values)
    if (!data) return
    return new Post(data)
  }

  static async all(pagination?: database.PaginationOptions): Promise<Post[]> {
    return this.db
      .all(pagination)
      .then((results) => results.map((data) => new Post(data)))
  }

  static async filter(
    filter: string,
    values?: any,
    pagination?: database.PaginationOptions
  ): Promise<Post[]> {
    return this.db
      .filter(filter, values, pagination)
      .then((results) => results.map((data) => new Post(data)))
  }

  getAuthor(): Promise<entities.User | void> {
    return entities.User.fromId(this.author_id)
  }

  async getParent(): Promise<Post | void> {
    if (!this.parent_id) return
    return Post.fromId(this.parent_id)
  }

  async getFormattedContent(): Promise<string> {
    const mentions = await this.getMentions()
    let formattedContent = utils.md.render(this.content)
    let cache = formattedContent

    if (cache.includes("@you")) {
      const parent = await this.getParent()
      if (parent) {
        const you = await parent.getAuthor()
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
    }

    if (cache.includes("@me")) {
      const me = await this.getAuthor()

      if (me) {
        while (cache.includes("@me")) {
          cache = cache.replace("@me", "")
          formattedContent = formattedContent.replace("@me", me.getHTMLAnchor())
        }
      }
    }

    for (const user of mentions) {
      const mention = "@" + user.display_name
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

  getLikes(): Promise<entities.Favorite[]> {
    return entities.Favorite.filter("post_id = ?", [this.id])
  }

  getChildren(): Promise<Post[]> {
    return Post.filter("parent_id = ?", this.id)
  }

  getAllChildren(): Promise<Post[]> {
    return this.getChildren()
      .then((children) =>
        Promise.all(children.map((child) => child.getAllChildren()))
      )
      .then((children) => children.flat())
  }

  // async getChildrenPagination(
  //   pageIndex: number
  // ): Promise<utils.Pagination<Post>> {
  //   return utils.paginate(await this.getChildren(), pageIndex)
  // }

  async getPath(): Promise<Post[]> {
    const path: Post[] = []
    let current: Post | void = this
    while (current) {
      path.push(current)
      current = await current.getParent()
    }
    return path.reverse()
  }

  async getMentions(): Promise<entities.User[]> {
    const mentions: number[] = []

    if (this.content.includes("@you")) {
      const parent = await this.getParent()
      if (parent) {
        mentions.push(parent.author_id)
      }
    }

    if (this.content.includes("@me")) {
      mentions.push(this.author_id)
    }

    return []
  }

  delete() {
    return this.db.delete(this.id)
  }
}
