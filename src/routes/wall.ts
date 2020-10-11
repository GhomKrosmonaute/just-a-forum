import app from "../server"
import * as entities from "../entities"
import * as utils from "../utils"

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
    const target = entities.User.fromId(req.params.user_id)

    if (!target) {
      return utils.error(res, "Invalid target user")
    }

    utils.page(req, res, "wall", { user, target })
  })
})
