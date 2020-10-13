import * as entities from "../entities"
import * as utils from "../utils"
import app from "../server"

app.get("/login", function (req, res) {
  utils.page(req, res, "login")
})

app.post("/login", async function (req, res) {
  const body = await utils.parseLogin(req)

  if (!body) {
    return utils.error(res, "Please enter an username and a password")
  }

  const { username, hash, admin } = body

  const user = entities.User.find((data) => {
    return data.username === username && data.password === hash
  })

  if (!user) {
    return utils.error(res, "Incorrect Username and/or Password!")
  }

  utils.logUser(req, user, admin)

  res.redirect("/wall")
})
