import * as post from "./post"
import * as user from "./user"

export interface LikeData {
  id: string
  user_id: string
  post_id: string
}

export interface Like {
  id: string
  user: user.User
  post: post.Post
}
