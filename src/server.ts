import express from "express"
import session from "express-session"
import parser from "body-parser"
import path from "path"

require("dotenv").config()

import root from "./routes/root"
import wall from "./routes/wall"
import login from "./routes/login"
import subscribe from "./routes/subscribe"

const app = express()

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "..", "views"))

app.use(
  express.static(path.join(__dirname, "..", "assets")),
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: true,
    saveUninitialized: true,
  }),
  parser.urlencoded({ extended: true }),
  parser.json()
)

app.get("/", root)
app.get("/wall", wall)
app.post("/login", login)
app.post("/subscribe", subscribe)

app.listen(2834)

console.table({
  SESSION_SECRET: process.env.SESSION_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  HASH_SALT: process.env.HASH_SALT,
})
