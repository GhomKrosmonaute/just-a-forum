import app from "../../server"
import * as utils from "../../utils"
import * as db from "../../database"

app.get("/wall", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    res.render("pages/wall", { user, getFullPost: db.getFullPost })
  })
})
