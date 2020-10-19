import app from "../server"
import * as utils from "../utils"
import * as entities from "../entities"

app.get("/profile", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    utils.page(req, res, "profile", { user, target: user })
  })
})

app.get("/profile/:user_id", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const target = entities.User.fromId(req.params.user_id)

    if (!target) {
      return utils.error(res, "Invalid target user")
    }

    utils.page(req, res, "profile", { user, target })
  })
})

app.post("/profile/:user_id", function (req, res) {
  utils.checkoutSession(req, res, async (user) => {
    const target = entities.User.fromId(req.params.user_id)

    // check param

    if (!target) {
      return utils.error(res, "Invalid target user")
    }

    // check user permission

    if (user.id !== target.id && !user.admin) {
      return utils.error(res, "Permission error.")
    }

    // check form data

    const username = req.body.username
    const old_password = await utils.hash(req.body.old_password)
    const new_password = await utils.hash(req.body.new_password)

    if (!user.admin) {
      if (!old_password || old_password !== target.password) {
        return utils.error(res, "Incorrect password! Please retry.")
      }
    }

    utils.validateUsername(res, username, () => {
      // patch

      target.patch({
        id: target.id,
        username: username ?? target.username,
        password: new_password ?? target.password,
        shortcuts: target.shortcuts,
      })

      // render

      utils.page(req, res, "profile", { user, target })
    })
  })
})
