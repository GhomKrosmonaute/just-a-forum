import * as entities from "../entities"
import * as utils from "../utils"
import app from "../server"

app.post("/subscribe", async function (req, res) {
  const body = await utils.parseLogin(req)

  if (!body) {
    return utils.error(res, "Please enter an username and a password")
  }

  const { username, hash, admin } = body

  if (/\s/.test(username)) {
    return utils.error(res, "Username mustn't contains spaces.")
  }

  if (username.length > 20) {
    return utils.error(res, "Username is too large (20 char max)")
  }

  if (entities.User.db.some((data) => data.username === username)) {
    return utils.error(res, "Username already used...")
  }

  const data: entities.UserData = {
    id: utils.makeId(),
    username,
    password: hash,
  }

  entities.User.add(data)

  if (req.session) {
    utils.logUser(req, data.id, admin)
    return res.redirect("/wall")
  } else {
    return utils.error(res, "Session system error...")
  }
})
