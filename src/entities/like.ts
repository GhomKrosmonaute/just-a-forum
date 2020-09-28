import * as post from "./post"
import * as user from "./user"

export interface LikeData {
  user_id: number
  post_id: number
}

export interface Like {
  user: user.User
  post: post.Post
}
