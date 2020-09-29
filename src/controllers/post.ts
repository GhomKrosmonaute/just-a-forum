import Enmap from "enmap"

import * as post from "../entities/post"
import * as user from "../entities/user"
import * as like from "../entities/like"

import * as _user from "./user"
import * as _like from "./like"

export const posts = new Enmap<string, post.PostData>({ name: "posts" })

export function getPost(id: string | null): post.Post | undefined {
  if (!id) return undefined
  const post = posts.get(id)
  if (!post) return undefined
  return {
    id,
    parent: getPost(post.parent_id),
    author: _user.getUser(post.author_id) as user.User,
    content: post.content,
    date: post.date,
  }
}

export function getPostLikes(post: post.Post): like.Like[] {
  return _like.likes
    .filterArray((data) => data.post_id === post.id)
    .map((data) => _like.getLike(data.id) as like.Like)
}

export function getPostChildren(post: post.Post): post.Post[] {
  return posts
    .filterArray((data) => !!data.parent_id && data.parent_id === post.id)
    .map((data) => getPost(data.id) as post.Post)
}

export function getFullPost(post: post.Post): post.FullPost {
  return {
    ...post,
    likes: getPostLikes(post),
    children: getPostChildren(post),
  }
}
