import * as post from "./post"
import * as like from "./like"

export interface UserData {
  id: string
  username: string
  password: string
}

export type User = UserData

export interface FullUser extends User {
  wall: post.Post[] | post.FullPost[]
  posts: post.Post[] | post.FullPost[]
  friends: User[]
  network: User[]
  ownLikes: like.Like[]
  likesFromPeople: like.Like[]
  givenFriendRequests: User[]
  sentFriendRequests: User[]
}
