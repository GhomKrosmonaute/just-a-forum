import Enmap from "enmap"

import * as user from "./entities/user"
import * as post from "./entities/post"
import * as like from "./entities/like"
import * as link from "./entities/link"

const users = new Enmap<string, user.UserData>({ name: "users" })
const posts = new Enmap<string, post.PostData>({ name: "posts" })
const likes = new Enmap<string, like.LikeData>({ name: "likes" })
const links = new Enmap<string, link.LinkData>({ name: "links" })

export function getUser(id: string): user.User | undefined {
  const user = users.get(id)
  if (!user) return undefined
  return user
}

export function getPost(id: string | null): post.Post | undefined {
  if (!id) return undefined
  const post = posts.get(id)
  if (!post) return undefined
  return {
    id,
    parent: getPost(post.parent_id),
    author: getUser(post.author_id) as user.User,
    content: post.content,
    date: post.date,
  }
}

export function getLike(id: string): like.Like | undefined {
  const like = likes.get(id)
  if (!like) return undefined
  return {
    id: like.id,
    user: getUser(like.user_id) as user.User,
    post: getPost(like.post_id) as post.Post,
  }
}

export function getLink(id: string): link.Link | undefined {
  const link = links.get(id)
  if (!link) return undefined
  return {
    id: link.id,
    author: getUser(link.author_id) as user.User,
    target: getUser(link.target_id) as user.User,
  }
}

export function getUserPosts(user: user.User): post.Post[] {
  return posts
    .filterArray((data) => data.author_id === user.id && !data.parent_id)
    .map((data) => getPost(data.id) as post.Post)
}

export function getUserLikes(user: user.User): like.Like[] {
  return likes
    .filterArray((data) => data.user_id === user.id)
    .map((data) => getLike(data.id) as like.Like)
}

export function getUserLinks(user: user.User): link.Link[] {
  return links
    .filterArray((data) => data.author_id === user.id)
    .map((data) => getLink(data.id) as link.Link)
}

export function getUserLikesFromPeople(user: user.User): like.Like[] {
  return likes
    .filterArray((data) => getPost(data.post_id)?.author.id === user.id)
    .map((data) => getLike(data.id) as like.Like)
}

export function getUserFriendRequests(user: user.User): link.Link[] {
  return links
    .filterArray((data) => data.author_id === user.id)
    .map((data) => getLink(data.id) as link.Link)
    .filter((link) => !areFriends(user, link.target))
}

export function getUserFriendRequestsFromPeople(user: user.User): link.Link[] {
  return links
    .filterArray((data) => data.target_id === user.id)
    .map((data) => getLink(data.id) as link.Link)
    .filter((link) => !areFriends(link.author, user))
}

export function getUserFriends(user: user.User): user.User[] {
  return users
    .filterArray((data) => {
      const otherUser = getUser(data.id)
      if (!otherUser) return false
      return areFriends(user, otherUser)
    })
    .map((data) => getUser(data.id) as user.User)
}

export function getFullUser(user: user.User): user.FullUser {
  return {
    ...user,
    posts: getUserPosts(user),
    friends: getUserFriends(user),
    ownLikes: getUserLikes(user),
    likesFromPeople: getUserLikesFromPeople(user),
    ownFriendRequests: getUserFriendRequests(user),
    friendRequestsFromPeople: getUserFriendRequestsFromPeople(user),
  }
}

export function getPostLikes(post: post.Post): like.Like[] {
  return likes
    .filterArray((data) => data.post_id === post.id)
    .map((data) => getLike(data.id) as like.Like)
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

export function areFriends(a: user.User, b: user.User): boolean {
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

export function getUserWallPosts(user: user.User): post.Post[] {
  return getUserFriends(user)
    .map((user) => getUserPosts(user))
    .flat()
    .sort((a, b) => a.date - b.date)
}

export { users, posts, likes, links }
