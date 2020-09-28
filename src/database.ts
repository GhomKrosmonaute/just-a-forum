import Enmap from "enmap"

import * as user from "./entities/user"
import * as post from "./entities/post"
import * as like from "./entities/like"
import * as link from "./entities/link"

const users = new Enmap<number, user.UserData>({ name: "users" })
const posts = new Enmap<number, post.PostData>({ name: "posts" })
const likes = new Enmap<number, like.LikeData>({ name: "likes" })
const links = new Enmap<number, link.LinkData>({ name: "links" })

function getUser(id: number): user.User | undefined {
  const user = users.get(id)
  if (!user) return undefined
  return user
}

function getPost(id: number | null): post.Post | undefined {
  if (!id) return undefined
  const post = posts.get(id)
  if (!post) return undefined
  return {
    id,
    parent: getPost(post.parent_id),
    author: getUser(post.author_id) as user.User,
    content: post.content,
  }
}

function getLike(user_id: number, post_id: number): like.Like | undefined {
  const like = likes.find(
    (data) => data.post_id === post_id && data.user_id === user_id
  )
  if (!like) return undefined
  return {
    user: getUser(like.user_id) as user.User,
    post: getPost(like.post_id) as post.Post,
  }
}

function getLink(author_id: number, target_id: number): link.Link | undefined {
  const link = links.find(
    (data) => data.author_id === author_id && data.target_id === target_id
  )
  if (!link) return undefined
  return {
    author: getUser(link.author_id) as user.User,
    target: getUser(link.target_id) as user.User,
  }
}

function getUserPosts(user: user.User): post.Post[] {
  return posts
    .filterArray((data) => data.author_id === user.id)
    .map((data) => getPost(data.id) as post.Post)
}

function getUserLikes(user: user.User): like.Like[] {
  return likes
    .filterArray((data) => data.user_id === user.id)
    .map((data) => getLike(data.user_id, data.post_id) as like.Like)
}

function getUserLinks(user: user.User): link.Link[] {
  return links
    .filterArray((data) => data.author_id === user.id)
    .map((data) => getLink(data.author_id, data.target_id) as link.Link)
}

function getFullUser(user: user.User): user.FullUser {
  return {
    ...user,
    posts: getUserPosts(user) as post.Post[],
    likes: getUserLikes(user) as like.Like[],
    links: getUserLinks(user) as link.Link[],
  }
}

function getFriends(user: user.User): user.User[] {
  return users.filterArray((data) => {
    const otherUser = getUser(data.id)
    if (!otherUser) return false
    return areFriends(user, otherUser)
  })
}

function areFriends(a: user.User, b: user.User): boolean {
  const a_links = getUserLinks(a),
    b_links = getUserLinks(b)
  return a_links.some((a_link) => {
    return b_links.some((b_link) => {
      return (
        a_link.target.id === b_link.author.id &&
        a_link.author.id === b_link.target.id
      )
    })
  })
}

export default {
  users,
  posts,
  likes,
  links,
  getUser,
  getPost,
  getLike,
  getLink,
  getUserPosts,
  getUserLikes,
  getUserLinks,
  areFriends,
  getFriends,
  getFullUser,
}
