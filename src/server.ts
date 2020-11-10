import express from "express"
import session from "express-session"
import parser from "body-parser"
import passport from "passport"
import discord from "passport-discord"
import refresh from "passport-oauth2-refresh"
import path from "path"

require("dotenv").config()

import * as utils from "./utils"
import * as entities from "./entities"

const discordStrategy = new discord.Strategy(
  {
    clientID: process.env.DISCORD_CLIENT_ID as string,
    clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    callbackURL: process.env.SITE_BASE_URL + "/feed",
  },
  async function (accessToken, refreshToken, profile, cb) {
    // @ts-ignore
    profile.refreshToken = refreshToken

    let user = await entities.User.fromSnowflake(profile.id)

    if (!user) {
      const id = await entities.User.db.push({
        fake: false,
        snowflake: profile.id,
        display_name: profile.username,
        avatar_url: profile.avatar ?? "/images/avatar.png",
        created_timestamp: Date.now(),
        description: null,
      })

      if (id) {
        user = await entities.User.fromId(id)
      }
    } else {
      await user.refresh(profile)
    }

    if (user) {
      cb(null, new entities.Profile(user, profile))
    } else {
      cb(new Error("Unknown Discord user..."), undefined)
    }
  }
)

passport.use(discordStrategy)
refresh.use(discordStrategy)

const app = express()

app.locals.site = {
  name: "Just a Forॐ",
  author: "Ɠɧॐ",
  description: "The JS Forum of JS Labs",
  url: process.env.SITE_BASE_URL,
  discord: "https://discord.gg/3vC2XWK",
  github: "https://github.com/CamilleAbella/just-a-forum",
  administrators: utils.parseAdministrators(),
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
  SITE_BASE_URL: process.env.SITE_BASE_URL,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  DATABASE_USERNAME: process.env.DATABASE_USERNAME,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  ADMINISTRATORS: process.env.ADMINISTRATORS?.split(","),
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
