import argon from "argon2"
import * as db from "../../database"
import * as utils from "../../utils"

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

  if (db.users.some((data) => data.username === username)) {
    return res.render("pages/error", {
      message: "Username already used...",
    })
  }

  const id = utils.makeId()

  console.log(id)

  db.users.set(id, {
    id,
    username,
    password: hash,
  })

  if (req.session) {
    utils.logUser(req, id)
    return res.redirect("/wall")
  } else {
    return res.render("pages/error", {
      message: "Session system error...",
    })
  }
}
