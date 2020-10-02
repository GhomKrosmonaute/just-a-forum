import express from "express"
import session from "express-session"
import parser from "body-parser"
import path from "path"

import * as utils from "./utils"

require("dotenv").config()
const uuid = require("uuid")

const app = express()

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "..", "views"))

app.use(
  express.static(path.join(__dirname, "..", "assets")),
  session({
    genid: () => uuid.v4(),
    secret: process.env.SESSION_SECRET as string,
    resave: true,
    saveUninitialized: true,
  }),
  parser.urlencoded({ extended: true }),
  parser.json()
)

app.listen(process.env.PORT ?? 2834)

console.table({
  SESSION_SECRET: process.env.SESSION_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
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
