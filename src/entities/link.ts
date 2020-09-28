import * as user from "./user"

export interface LinkData {
  author_id: string
  target_id: string
}

export interface Link {
  author: user.User
  target: user.User
}
