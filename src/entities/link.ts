import * as user from "./user"

export interface LinkData {
  id: string
  author_id: string
  target_id: string
}

export interface Link {
  id: string
  author: user.User
  target: user.User
}
