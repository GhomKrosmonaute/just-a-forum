import * as database from "../database"
import * as entities from "../entities"
import * as utils from "../utils"

type UserData = database.TableData["user"]

export class User implements UserData {
  static db = new database.Database("user")

  public db = User.db

  public admin: boolean
  public id: number
  public snowflake: string
  public description: string | null
  public display_name: string | null
  public created_timestamp: number

  constructor(data: UserData) {
    this.id = data.id
    this.snowflake = data.snowflake
    this.description = data.description
    this.display_name = data.display_name
    this.created_timestamp = data.created_timestamp
    this.admin = utils.parseAdministrators().includes(data.id)
  }

  get data(): UserData {
    return {
      id: this.id,
      snowflake: this.snowflake,
      description: this.description,
      display_name: this.display_name,
      created_timestamp: this.created_timestamp,
    }
  }

  get online(): boolean {
    return (
      utils.sessions.has(this.id) &&
      Date.now() <
        (utils.sessions.get(this.id) as number) + utils.sessionTimeout
    )
  }

  static async fromId(id: number): Promise<User | void> {
    const data = await this.db.get(id)
    if (!data) return
    return new User(data)
  }

  static async fromSnowflake(snowflake: string): Promise<User | void> {
    const data = await this.db.find("snowflake = ?", [snowflake])
    if (!data) return
    return new User(data)
  }

  static async find(filter: string, values?: any): Promise<User | void> {
    const data = await this.db.find(filter, values)
    if (!data) return
    return new User(data)
  }

  static async filter(filter: string, values?: any): Promise<User[]> {
    return this.db
      .filter(filter, values)
      .then((results) => results.map((data) => new User(data)))
  }

  async isFriendWith(user: User): Promise<boolean> {
    return entities.FriendRequest.db
      .count(
        `target_id = ? AND fr.author_id = ? OR fr.target_id = ? AND fr.author_id = ?`,
        [this.id, user.id, user.id, this.id]
      )
      .then((count) => count > 1)
  }

  getHTMLAnchor(): string {
    return `<a href='/profile/${this.id}' class="decoration-none" title="Visit user profile">@${this.display_name}</a>`
  }

  /** max 25 per user */
  getShortcuts(): Promise<entities.Shortcut[]> {
    return entities.Shortcut.filter("user_id = ?", [this.id])
  }

  getFeed(): Promise<entities.Post[]> {
    return this.getPosts()
      .concat(
        this.getFriends()
          .map((user) => user.getPosts())
          .flat()
      )
      .sort(utils.sortByDate)
  }

  async getFeedPagination(
    pageIndex: number
  ): Promise<utils.Pagination<entities.Post>> {
    return utils.paginate(await this.getFeed(), pageIndex)
  }

  getPosts(): Promise<entities.Post[]> {
    return entities.Post.filter("author_id = ? AND parent_id IS NULL", [
      this.id,
    ])
  }

  getComments(): Promise<entities.Post[]> {
    return entities.Post.filter("author_id = ? AND parent_id IS NOT NULL", [
      this.id,
    ])
  }

  getAllPosts(): Promise<entities.Post[]> {
    return entities.Post.filter("author_id = ?", [this.id])
  }

  async getPostsPagination(
    pageIndex: number
  ): Promise<utils.Pagination<entities.Post>> {
    return utils.paginate(await this.getPosts(), pageIndex)
  }

  // getNetwork(): Promise<User[]> {
  //   return User.db.query(`
  //     SELECT * FROM ${User.db.table} u
  //     LEFT JOIN ${database.tableNames.FRIEND_REQUEST} fr
  //     ON ${database.areFriendQuery}
  //   `, [this.id]).then()
  //
  //   // const friends = this.getFriends()
  //   // return utils
  //   //   .removeDuplicate(
  //   //     friends
  //   //       .map((friend) =>
  //   //         friend
  //   //           .getFriends()
  //   //           .filter((friend) => friend.id !== this.id)
  //   //           .map((friend) => friend.id)
  //   //       )
  //   //       .flat()
  //   //   )
  //   //   .filter((id) => !friends.some((friend) => friend.id === id))
  //   //   .map((id) => User.fromId(id) as User)
  // }

  getFriends(): Promise<User[]> {
    return User.filter(
      `(
          SELECT COUNT(fr.id)
          FROM ${entities.FriendRequest.db.table} fr
          WHERE (fr.author_id = ? AND fr.target_id = ${this.db.table}.id)
          OR (fr.author_id = ${this.db.table}.id AND fr.target_id = ?)
        ) > 1
        `,
      [this.id]
    )
  }

  getFavorites(): Promise<entities.Favorite[]> {
    return entities.Favorite.filter("user_id = ?", [this.id])
  }

  /** vos demandes d'ami en attente */
  getPending(): Promise<User[]> {
    return User.filter(
      `(
        select count(fr.id)
        from ${entities.FriendRequest.db.table} fr
        where fr.author_id = ? and fr.target_id = ${this.db.table}.id
      ) = 1
      and (
        select count(fr.id)
        from ${entities.FriendRequest.db.table} fr
        where fr.author_id = ${this.db.table}.id and fr.target_id = ?
      ) = 0`,
      [this.id]
    )
  }

  /** les demandes d'autre utilisateurs que vous n'avez pas accepté */
  getRequests(): Promise<User[]> {
    return User.filter(
      `(
        select count(fr.id)
        from ${entities.FriendRequest.db.table} fr
        where fr.author_id = ? and fr.target_id = ${this.db.table}.id
      ) = 0
      and (
        select count(fr.id)
        from ${entities.FriendRequest.db.table} fr
        where fr.author_id = ${this.db.table}.id and fr.target_id = ?
      ) = 1`,
      [this.id]
    )
  }

  delete() {
    return this.db.delete(this.id)
  }

  async patch(data: Omit<UserData, "created_timestamp">) {
    if (data.id !== this.id) {
      throw new Error("oops")
    }
    this.display_name = data.display_name
    this.description = data.description
    await User.db.patch(data)
  }
}
