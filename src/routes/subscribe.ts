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
    salt: Buffer.from(process.env.HASH_SALT as string),
  })

  if (db.users.some((data) => data.username === username)) {
    return res.render("pages/error", {
      message: "Username already used...",
    })
  }

  const id = String(Date.now().toString(16) + ":" + Math.random().toString(16))

  console.log(id)

  db.users.set(id, {
    id,
    username,
    password: hash,
  })

  if (req.session) {
    req.session.logged = true
    req.session.username = username
    return res.redirect("/wall")
  } else {
    return res.render("pages/error", {
      message: "Session system error...",
    })
  }
}
