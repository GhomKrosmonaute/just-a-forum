import Enmap from "enmap"

import * as like from "../entities/like"
import * as user from "../entities/user"
import * as post from "../entities/post"

import * as _post from "./post"
import * as _user from "./user"

export const likes = new Enmap<string, like.LikeData>({ name: "likes" })

export function getLike(id: string): like.Like | undefined {
  const like = likes.get(id)
  if (!like) return undefined
  return {
    id: like.id,
    user: _user.getUser(like.user_id) as user.User,
    post: _post.getPost(like.post_id) as post.Post,
  }
}
