import * as post from "./post"
import * as user from "./user"

export interface LikeData {
  user_id: string
  post_id: string
}

export interface Like {
  user: user.User
  post: post.Post
}
