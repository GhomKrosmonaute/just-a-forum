import app from "../server"
import * as utils from "../utils"
import * as db from "../database"

app.get("/wall", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    res.render("pages/wall", {
      user,
      target: user,
    })
  })
})

app.get("/wall/:user_id", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const target_id = req.params.user_id

    if (!target_id) {
      return utils.error(res, "Unknown user")
    }

    const data = db.getUser(target_id)

    if (!data) {
      return utils.error(res, "Unknown user.")
    }

    const target = db.getFullUser(data, true)

    utils.page(req, res, "wall", { user, target })
  })
})
