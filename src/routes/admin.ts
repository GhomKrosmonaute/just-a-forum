import app from "../server"
import * as utils from "../utils"
import * as entities from "../entities"

app.get("/admin", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    if (!user.admin) {
      return utils.error(res, "Access denied.")
    }
    utils.page(req, res, "admin")
  })
})
