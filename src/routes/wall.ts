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
    const target_id = req.params.user_id
    const target = entities.User.fromId(target_id)

    if (!target) {
      return utils.error(res, "Unknown user")
    }

    utils.page(req, res, "wall", { user, target })
  })
})
