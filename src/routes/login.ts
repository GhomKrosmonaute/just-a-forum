import * as db from "../database"
import * as utils from "../utils"
import app from "../server"

app.post("/login", async function (req, res) {
  const body = await utils.parseLogin(req)

  if (!body) {
    return utils.error(res, "Please enter an username and a password")
  }

  const { username, hash, admin } = body

  const data = db.users.find((data) => data.username === username)

  if (!data || data.password !== hash) {
    return utils.error(res, "Incorrect Username and/or Password!")
  }

  utils.logUser(req, data.id, admin)

  res.redirect("/wall")
})
