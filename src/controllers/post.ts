import Enmap from "enmap"
import dayjs from "dayjs"

import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

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

export function getPostChildren(
  post: post.Post,
  full: boolean = false
): post.Post[] | post.FullPost[] {
  return posts
    .filterArray((data) => !!data.parent_id && data.parent_id === post.id)
    .map((data) =>
      full ? getFullPostById(data.id) : (getPost(data.id) as post.Post)
    )
    .sort((a, b) => b.date - a.date)
}

export function getPostPath(post: post.Post): post.Post[] {
  const path: post.Post[] = []
  let current: post.Post | undefined = post
  while (current) {
    path.push(current)
    current = current.parent
  }
  return path.reverse()
}

export function getFullPost(
  post: post.Post,
  fullChildren: boolean = false
): post.FullPost {
  return {
    ...post,
    likes: getPostLikes(post),
    children: getPostChildren(post, fullChildren),
    path: getPostPath(post),
    since: dayjs(post.date).fromNow(),
  }
}

export function getFullPostById(
  id: string,
  fullChildren: boolean = false
): post.FullPost {
  return getFullPost(getPost(id) as post.Post, fullChildren)
}
