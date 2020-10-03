import * as db from "../database"
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

  if (db.users.some((data) => data.username === username)) {
    return utils.error(res, "Username already used...")
  }

  const id = utils.makeId()

  console.log(id)

  db.users.set(id, {
    id,
    username,
    password: hash,
  })

  if (req.session) {
    utils.logUser(req, id, admin)
    return res.redirect("/wall")
  } else {
    return utils.error(res, "Session system error...")
  }
})
