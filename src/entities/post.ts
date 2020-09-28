import * as user from "./user"

export interface PostData {
  id: string
  author_id: string
  parent_id: string | null
  content: string
}

export interface Post {
  id: string
  author: user.User
  parent?: Post
  content: string
}
