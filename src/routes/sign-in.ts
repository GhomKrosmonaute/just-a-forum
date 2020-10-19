import * as entities from "../entities"
import * as utils from "../utils"
import app from "../server"

app.get("/sign-in", function (req, res) {
  res.render("pages/sign-in")
})

app.post("/sign-in", async function (req, res) {
  const body = await utils.parseLogin(req)

  if (!body) {
    return utils.error(res, "Please enter an username and a password")
  }

  const { username, hash } = body

  utils.validateUsername(res, username, () => {
    if (entities.User.db.some((data) => data.username === username)) {
      return utils.error(res, "Username already used...")
    }

    const data: entities.UserData = {
      id: utils.makeId(),
      username,
      password: hash,
      shortcuts: [],
    }

    entities.User.add(data)

    if (req.session) {
      utils.logUser(req, data.id)
      return res.redirect("/feed")
    } else {
      return utils.error(res, "Session system error...")
    }
  })
})

app.get("/unsubscribe/:user_id", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const target_id = req.params.user_id
    const target = entities.User.fromId(target_id)

    if (!target) {
      return utils.error(res, "Unknown user...")
    }

    if (target.id !== user.id && !user.admin) {
      return utils.error(res, "Permission error.")
    }

    target.delete()

    if (target.id === user.id) {
      utils.logout(req, res)
    } else {
      utils.back(req, res)
    }
  })
})
