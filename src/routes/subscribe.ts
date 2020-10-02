import * as db from "../database"
import * as utils from "../utils"
import app from "../server"

app.post("/subscribe", async function (req, res) {
  const body = await utils.parseLogin(req)

  if (!body) {
    return res.render("pages/error", {
      message: "Please enter an username and a password",
    })
  }

  const { username, hash } = body

  if (/\s/.test(username)) {
    return res.render("pages/error", {
      message: "Username mustn't contains spaces.",
    })
  }

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
})
