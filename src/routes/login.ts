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

  const data = db.users.find((data) => data.username === username)

  if (!data || data.password !== hash) {
    return res.render("pages/error", {
      message: "Incorrect Username and/or Password!",
    })
  }

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
