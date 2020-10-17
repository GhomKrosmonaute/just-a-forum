import app from "../server"
import * as utils from "../utils"

app.get("/feed", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const pageIndex = Number(req.query.page ?? 0)
    utils.page(req, res, "feed", { user, pageIndex })
  })
})
