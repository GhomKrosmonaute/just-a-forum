import argon from "argon2"
import db from "../database"

export default async function (req: any, res: any) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.render("pages/error", {
      message: "Please enter a username and a password",
    })
  }

  const hash = await argon.hash(password as string, {
    salt: new Buffer(process.env.HASH_SALT as string),
  })

  if (db.users.has(username)) {
    return res.render("pages/error", {
      message: "Username already used...",
    })
  }

  const id = Date.now()

  db.users.set(id, {
    id,
    username,
    password: hash,
  })

  return res.redirect("/wall")
}