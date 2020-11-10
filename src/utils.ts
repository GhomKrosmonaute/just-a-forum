import express from "express"
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
        // const regex = /\/\*(?:[\s\S]*?)\*\//g
        // let match
        // while ((match = regex.exec(str)) !== null) {
        //   const comment = match[0]
        //   if (comment && comment.includes("\n")) {
        //     str = str.replace(comment, "/* aborted comment */")
        //   }
        // }

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

export function checkParamId(
  req: express.Request,
  entityName: string
): number | void {
  const value =
    req.params[entityName[0].toLowerCase() + entityName.slice(1) + "_id"]

  if (!/^\d+$/.test(value)) return

  return Number(value)
}

export async function getEntityFromParam<T>(
  req: express.Request,
  res: express.Response,
  entityName: string
): Promise<T | void> {
  const id = checkParamId(req, entityName)

  if (!id) return error(res, `Invalid ${entityName} ID parameter.`)

  // @ts-ignore
  const entity = await entities[entityName].fromId(id)

  if (!entity) {
    return error(
      res,
      `This ${
        entity[0].toLowerCase() + entity.slice(1)
      } no longer exists or the given ID is incorrect.`
    )
  }

  return entity as T
}

export function parseAdministrators() {
  return process.env.ADMINISTRATORS?.split(",").map((id) => Number(id)) ?? []
}

export function addLineNumbersTo(code: string): string {
  const lines = code.trim().split("\n")
  if (lines.length < 5) return code
  return lines
    .map((line, index) => {
      //`<span class="hljs-line"><span class="hljs-line-number">${index}</span><span class="hljs-line-code">${line}</span></span>`
      return `<span class="hljs-line-number">${index}</span>${line}`
    })
    .join("\n")
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

export function error(res: express.Response, message: string) {
  res.render("pages/error", { message })
}

export function page(
  req: express.Request,
  res: express.Response,
  page: string,
  options: {} = {}
) {
  if (isSessionActive(req)) {
    req.session.lastPage = req.path
  }

  options = {
    redirect: "",
    ...req.query,
    ...req.params,
    ...options,
  }

  res.render("pages/" + page, options)
}

export function back(req: express.Request, res: express.Response) {
  res.redirect(req.session?.lastPage ?? "/")
}

export function makeId(): string {
  return uuid.v4()
}

export type Request = express.Request & { session: Express.Session }

export function isSessionActive(req: express.Request): req is Request {
  return !!req.session?.logged
}

export function logUser(req: express.Request, user: entities.User | string) {
  const user_id = typeof user === "string" ? user : user.id
  if (req.session) {
    req.session.logged = true
    req.session.user_id = user_id
  } else {
    console.error("Failed to log user: " + user_id)
  }
}

export function logout(req: Request, res: express.Response) {
  sessions.delete(req.session.user_id)
  req.session?.destroy?.(() => {
    res.redirect("/")
  })
}

export function loggedUserId(req: Request): number
export function loggedUserId(req: express.Request): undefined
export function loggedUserId(
  req: express.Request | Request
): number | undefined {
  return req.session?.user_id
}

export async function hash(
  res: express.Response,
  password: string
): Promise<string | null> {
  if (password.trim().length < 5) {
    error(res, "The password must be contains minimum 5 chars.")
    return null
  }
  return argon.hash(password, {
    salt: Buffer.from(process.env.HASH_SALT as string),
  })
}

export function validateDisplayName(
  res: express.Response,
  username: string,
  callback: () => unknown
): void {
  if (/\s/.test(username)) {
    return error(res, "Display name mustn't contains spaces.")
  }

  if (username.length > 20) {
    return error(res, "Display name is too large (20 char max)")
  }

  callback()
}

export async function parseLogin(
  req: express.Request,
  res: express.Response
): Promise<{
  username: string
  hash: string
} | null> {
  const username: string = req.body.username?.trim()
  const password: string = req.body.password

  if (!username || !password) return null

  const _hash = await hash(res, password)

  if (!_hash) return null

  return {
    username,
    hash: _hash,
  }
}

/** Contains sessions activity timeouts <user_id, last_activity_time> */
export const sessions = new Map<number, number>()
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
  req: express.Request,
  res: express.Response,
  callback: (user: entities.User, session: Request) => any
) {
  if (isSessionActive(req)) {
    entities.User.fromId(loggedUserId(req)).then((user) => {
      if (user) {
        sessions.set(user.id, Date.now())
        callback(user, req)
      } else {
        error(res, "Internal error!")
      }
    })
  } else {
    res.redirect(`/login?redirect=${req.path}`)
  }
}

export function turnAround(
  req: express.Request,
  res: express.Response,
  defaultRoute: string
) {
  res.redirect(
    typeof req.query.redirect === "string" && req.query.redirect.length > 2
      ? req.query.redirect
      : defaultRoute
  )
}
