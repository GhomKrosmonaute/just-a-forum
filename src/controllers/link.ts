import Enmap from "enmap"

import * as link from "../entities/link"
import * as user from "../entities/user"

import * as _user from "./user"

export const links = new Enmap<string, link.LinkData>({ name: "links" })

export function getLink(id: string): link.Link | undefined {
  const link = links.get(id)
  if (!link) return undefined
  return {
    id: link.id,
    author: _user.getUser(link.author_id) as user.User,
    target: _user.getUser(link.target_id) as user.User,
  }
}
