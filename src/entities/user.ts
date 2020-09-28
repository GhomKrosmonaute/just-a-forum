import * as post from "./post"
import * as like from "./like"
import * as link from "./link"

export interface UserData {
  id: string
  username: string
  password: string
}

export type User = UserData

export interface FullUser extends User {
  posts: post.Post[]
  likes: like.Like[]
  links: link.Link[]
}
