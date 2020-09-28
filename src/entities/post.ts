import * as user from "./user"

export interface PostData {
  id: number
  author_id: number
  parent_id: number | null
  content: string
}

export interface Post {
  id: number
  author: user.User
  parent?: Post
  content: string
}
