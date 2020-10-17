import express from "express"
import session from "express-session"
import parser from "body-parser"
import path from "path"

import * as utils from "./utils"

require("dotenv").config()

const app = express()

app.locals.site = {
  name: "Just a Forॐ",
  author: "Ɠɧॐ",
  url: "https://www.just-a-forum.tk",
  discord: "https://discord.gg/3vC2XWK",
  github: "https://github.com/CamilleAbella/just-a-forum",
  deployedAt: Date.now(),
  deployedSince() {
    return utils.dayjs(this.deployedAt).fromNow()
  },
}

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "..", "views"))

app.use(
  express.static(path.join(__dirname, "..", "public")),
  session({
    genid: utils.makeId,
    secret: process.env.SESSION_SECRET as string,
    resave: true,
    saveUninitialized: true,
  }),
  parser.urlencoded({ extended: false }),
  parser.json()
)

app.listen(process.env.PORT ?? 2834)

console.table({
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  SESSION_SECRET: process.env.SESSION_SECRET,
  HASH_SALT: process.env.HASH_SALT,
  PORT: process.env.PORT ?? 2834,
})

export default app
;(async function () {
  try {
    await utils.forEachFileInDirectories(
      [path.join(__dirname, "routes")],
      require
    )
  } catch (error) {
    throw error
  }
})()

setInterval(utils.refreshSessions, utils.sessionTimeout)
