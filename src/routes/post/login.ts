import * as db from "../../database"
import * as utils from "../../utils"
import app from "../../server"

app.post("/login", async function (req, res) {
  const body = await utils.parseLogin(req)

  if (!body) {
    return res.render("pages/error", {
      message: "Please enter an username and a password",
    })
  }

  const { username, hash } = body

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
})
