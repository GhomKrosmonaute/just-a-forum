import * as user from "./user"

export interface LinkData {
  author_id: number
  target_id: number
}

export interface Link {
  author: user.User
  target: user.User
}
