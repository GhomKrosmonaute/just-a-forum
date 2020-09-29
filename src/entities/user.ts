import * as post from "./post"
import * as like from "./like"
import * as link from "./link"

export interface UserData {
  id: string
  username: string
  password: string
}

export type User = UserData

export interface FullUser extends User {
  wall: post.Post[]
  posts: post.Post[]
  friends: User[]
  ownLikes: like.Like[]
  likesFromPeople: like.Like[]
  ownFriendRequests: link.Link[]
  friendRequestsFromPeople: link.Link[]
}
