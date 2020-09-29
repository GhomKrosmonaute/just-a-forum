import Enmap from "enmap"

import * as user from "../entities/user"
import * as post from "../entities/post"
import * as like from "../entities/like"
import * as link from "../entities/link"

import * as _post from "./post"
import * as _like from "./like"
import * as _link from "./link"

export const users = new Enmap<string, user.UserData>({ name: "users" })

export function getUser(id: string): user.User | undefined {
  const user = users.get(id)
  if (!user) return undefined
  return user
}

export function getUserPosts(user: user.User): post.Post[] {
  return _post.posts
    .filterArray((data) => data.author_id === user.id && !data.parent_id)
    .map((data) => _post.getPost(data.id) as post.Post)
}

export function getUserLikes(user: user.User): like.Like[] {
  return _like.likes
    .filterArray((data) => data.user_id === user.id)
    .map((data) => _like.getLike(data.id) as like.Like)
}

export function getUserLinks(user: user.User): link.Link[] {
  return _link.links
    .filterArray((data) => data.author_id === user.id)
    .map((data) => _link.getLink(data.id) as link.Link)
}

export function getUserLikesFromPeople(user: user.User): like.Like[] {
  return _like.likes
    .filterArray((data) => _post.getPost(data.post_id)?.author.id === user.id)
    .map((data) => _like.getLike(data.id) as like.Like)
}

export function getUserFriendRequests(user: user.User): link.Link[] {
  return _link.links
    .filterArray((data) => data.author_id === user.id)
    .map((data) => _link.getLink(data.id) as link.Link)
    .filter((link) => !areFriends(user, link.target))
}

export function getUserFriendRequestsFromPeople(user: user.User): link.Link[] {
  return _link.links
    .filterArray((data) => data.target_id === user.id)
    .map((data) => _link.getLink(data.id) as link.Link)
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

export function getUserWallPosts(user: user.User): post.Post[] {
  return getUserPosts(user)
    .concat(
      getUserFriends(user)
        .map((user) => getUserPosts(user))
        .flat()
    )
    .sort((a, b) => b.date - a.date)
}

export function getFullUser(user: user.User): user.FullUser {
  return {
    ...user,
    wall: getUserWallPosts(user),
    posts: getUserPosts(user),
    friends: getUserFriends(user),
    ownLikes: getUserLikes(user),
    likesFromPeople: getUserLikesFromPeople(user),
    ownFriendRequests: getUserFriendRequests(user),
    friendRequestsFromPeople: getUserFriendRequestsFromPeople(user),
  }
}

export function areFriends(a: user.User, b: user.User): boolean {
  const a_links = getUserLinks(a)
  const b_links = getUserLinks(b)
  return a_links.some((a_link) => {
    return b_links.some((b_link) => {
      return (
        a_link.target.id === b_link.author.id &&
        a_link.author.id === b_link.target.id
      )
    })
  })
}
