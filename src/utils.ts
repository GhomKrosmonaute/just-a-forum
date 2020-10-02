import argon from "argon2"
import url from "url"
import fs from "fs/promises"
import path from "path"

import * as user from "./entities/user"
import * as db from "./database"

const uuid = require("uuid")

export async function forEachFileInDirectories(
  pathList: string[],
  callback: (filePath: string) => Promise<any>
) {
  for (const _path of pathList) {
    const dir = await fs.readdir(_path)
    for (const filename of dir) {
      const filePath = path.join(_path, filename)
      if ((await fs.stat(filePath)).isDirectory()) {
        await forEachFileInDirectories([filePath], callback)
      } else {
        await callback(filePath)
      }
    }
  }
}

export function checkoutSession(
  req: any,
  res: any,
  callback: (user: user.FullUser) => any
) {
  if (isUserLogged(req)) {
    const user = db.getFullUserById(loggedUserId(req), true)
    callback(user)
  } else {
    res.render("pages/error", {
      message: "Session expired... Please <a href='/'>login</a>.",
    })
  }
}

export function back(req: any, res: any) {
  // todo: user session to redirect to last rendered page (or use an historque middleware)

  let redirect = "/"

  if (req.headers?.referer) {
    const previousUrl = new url.URL(req.headers.referer)
    redirect = previousUrl.pathname
  }

  for (const route of ["/like", "/login", "/post", "/search", "/subscribe"]) {
    if (redirect.toLowerCase() === route) {
      redirect = "/"
      break
    }
  }

  res.redirect(redirect)
}

export function makeId(): string {
  return uuid.v4()
}

export function isUserLogged(req: any): boolean {
  return !!req.session?.logged
}

export function logUser(req: any, user_id: string) {
  req.session.logged = true
  req.session.user_id = user_id
}

export function loggedUserId(req: any): string {
  return req.session.user_id
}

export async function parseLogin(
  req: any
): Promise<{
  username: string
  hash: string
} | null> {
  const username: string = req.body.username?.trim()
  const password: string = req.body.password

  if (!username || !password) return null

  const hash = await argon.hash(password, {
    salt: Buffer.from(process.env.HASH_SALT as string),
  })

  return {
    username,
    hash,
  }
}
