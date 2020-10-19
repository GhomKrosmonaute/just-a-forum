import argon from "argon2"
import fs from "fs/promises"
import path from "path"
import Markdown from "markdown-it"
import hljs from "highlightjs"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

import * as entities from "./entities"

const uuid = require("uuid")

dayjs.extend(relativeTime)

export { dayjs }

export const md: Markdown = new Markdown({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        // remove multiline comments
        const regex = /\/\*(?:[\s\S]*?)\*\//g
        let match
        while ((match = regex.exec(str)) !== null) {
          const comment = match[0]
          if (comment && comment.includes("\n")) {
            str = str.replace(comment, "")
          }
        }

        // parse code
        const code = hljs.highlight(lang, str, true).value

        // place line numbers
        const withLineNumbers = addLineNumbersTo(code)

        // return result
        return `<pre class="hljs"><code>${withLineNumbers}</code></pre>`
      } catch (_) {}
    }
    return (
      '<pre class="hljs"><code>' +
      addLineNumbersTo(md.utils.escapeHtml(str)) +
      "</code></pre>"
    )
  },
})

export function parseAdministrators() {
  return process.env.ADMINISTRATORS?.split(",") ?? []
}

export function addLineNumbersTo(code: string): string {
  return code
    .trim()
    .split("\n")
    .map((line, index) => {
      return `<span class="hljs-line"><span class="hljs-line-number">${index}</span><span class="hljs-line-code">${line}</span></span>`
    })
    .join("\n")
}

export function sortByDate(a: entities.Post, b: entities.Post): number {
  const a_recent = Math.max(
    a.date,
    ...a.getAllChildren().map((child) => child.date)
  )
  const b_recent = Math.max(
    b.date,
    ...b.getAllChildren().map((child) => child.date)
  )
  return b_recent - a_recent
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

export function logUser(req: any, user: entities.User | string) {
  req.session.logged = true
  req.session.user_id = typeof user === "string" ? user : user.id
}

export function logout(req: any, res: any) {
  sessions.delete(req.session.user_id)
  req.session?.destroy?.(() => {
    res.redirect("/")
  })
}

export function loggedUserId(req: any): string {
  return req.session.user_id
}

export function hash(password: string): Promise<string> {
  return argon.hash(password, {
    salt: Buffer.from(process.env.HASH_SALT as string),
  })
}

export function validateUsername(
  res: any,
  username: string,
  callback: () => unknown
): void {
  if (/\s/.test(username)) {
    return error(res, "Username mustn't contains spaces.")
  }

  if (username.length > 20) {
    return error(res, "Username is too large (20 char max)")
  }

  callback()
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

  const _hash = await hash(password)

  return {
    username,
    hash: _hash,
  }
}

/** Contains sessions activity timeouts <user_id, last_activity_time> */
export const sessions = new Map<string, number>()
export const sessionTimeout = 1000 * 60 * 3 // 3 min

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
      sessions.set(user.id, Date.now())
      callback(user)
    } else {
      error(res, "Internal error!")
    }
  } else {
    error(res, "Session expired... Please <a href='/'>login</a>.")
  }
}

export interface Pagination<T> {
  items: T[]
  pages: T[][]
  page: T[]
  index: number
  next: boolean
  prev: boolean
  lastIndex: number
  active: boolean
}

export const maxItemPerPage: number = 6

export function paginate<T>(items: T[], pageIndex: number = 0): Pagination<T> {
  const pages: T[][] = []
  const pageCount = Math.ceil(items.length / maxItemPerPage)
  for (let i = 0; i < pageCount; i++) {
    pages.push(items.slice(maxItemPerPage * i, maxItemPerPage * (i + 1)))
  }
  return {
    items,
    pages,
    page: pages[pageIndex] ?? [],
    index: pageIndex,
    next: pageIndex < pageCount - 1,
    prev: pageIndex > 0,
    lastIndex: pageCount - 1,
    active: pages.length > 1,
  }
}
