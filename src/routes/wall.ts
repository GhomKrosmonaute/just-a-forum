import app from "../server"
import * as utils from "../utils"

app.get("/wall", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const pageIndex = Number(req.query.page ?? 0)
    utils.page(req, res, "wall", { user, pageIndex })
  })
})
