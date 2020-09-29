import * as user from "./user"
import * as like from "./like"

export interface PostData {
  id: string
  author_id: string
  parent_id: string | null
  content: string
  date: number
}

export interface Post {
  id: string
  author: user.User
  parent?: Post
  content: string
  date: number
}

export interface FullPost extends Post {
  likes: like.Like[]
  children: Post[]
  path: Post[]
}
