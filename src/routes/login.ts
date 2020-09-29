import argon from "argon2"
import * as db from "../database"
import * as utils from "../utils"

export default async function (req: any, res: any) {
  const username: string = req.body.username
  const password: string = req.body.password

  if (!username || !password) {
    return res.render("pages/error", {
      message: "Please enter a username and a password",
    })
  }

  const hash = await argon.hash(password, {
    salt: Buffer.from(process.env.HASH_SALT as string),
  })

  const data = db.users.find((data) => data.username === username)

  if (!data || data.password !== hash) {
    return res.render("pages/error", {
      message: "Incorrect Username and/or Password!",
    })
  }

  if (req.session) {
    utils.logUser(req, data.id)
    return res.redirect("/wall")
  } else {
    return res.render("pages/error", {
      message: "Session system error...",
    })
  }
}
