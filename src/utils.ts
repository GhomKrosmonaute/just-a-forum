import argon from "argon2"
import fs from "fs/promises"
import path from "path"
import markdown from "markdown-it"

import * as entities from "./entities"

const uuid = require("uuid")

export const md = markdown({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
})

export interface Dated {
  date: number
}

export function sortByDate(a: Dated, b: Dated): number {
  return b.date - a.date
}

export function removeDuplicate<T>(array: T[]): T[] {
  return [...new Set(array)]
}

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

export function error(res: any, message: string) {
  res.render("pages/error", { message })
}

export function page(req: any, res: any, page: string, options?: any) {
  if (isUserLogged(req)) {
    req.session.lastPage = req.path
  }

  res.render("pages/" + page, options)
}

export function back(req: any, res: any) {
  res.redirect(req.session?.lastPage ?? "/")
}

export function makeId(): string {
  return uuid.v4()
}

export function isUserLogged(req: any): boolean {
  return !!req.session?.logged
}

export function isUserAdmin(req: any): boolean {
  return !!req.session?.admin
}

export function logUser(
  req: any,
  user: entities.User | string,
  admin: boolean
) {
  req.session.admin = admin
  req.session.logged = true
  req.session.user_id = typeof user === "string" ? user : user.id
}

export function loggedUserId(req: any): string {
  return req.session.user_id
}

export async function parseLogin(
  req: any
): Promise<{
  username: string
  hash: string
  admin: boolean
} | null> {
  const username: string = req.body.username?.trim()
  const password: string = req.body.password

  if (!username || !password) return null

  const admin =
    password === process.env.ADMIN_PASSWORD &&
    username === process.env.ADMIN_USERNAME

  const hash = await argon.hash(password, {
    salt: Buffer.from(process.env.HASH_SALT as string),
  })

  return {
    username,
    hash,
    admin,
  }
}

/** Contains sessions activity timeouts <user_id, last_activity_time> */
export const sessions = new Map<string, number>()
export const sessionTimeout = 600000 // 10 min

export function refreshSessions() {
  const now = Date.now()
  sessions.forEach((time, id) => {
    if (now > time + sessionTimeout) {
      sessions.delete(id)
    }
  })
}

export function checkoutSession(
  req: any,
  res: any,
  callback: (user: entities.User) => any
) {
  if (isUserLogged(req)) {
    const user = entities.User.fromId(loggedUserId(req))
    if (user) {
      user.admin = isUserAdmin(req)
      sessions.set(user.id, Date.now())
      callback(user)
    } else {
      error(res, "Internal error!")
    }
  } else {
    error(res, "Session expired... Please <a href='/'>login</a>.")
  }
}
