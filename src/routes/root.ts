import app from "../server"
import * as utils from "../utils"

app.get("/", function (req, res) {
  if (utils.isUserLogged(req)) {
    res.redirect("/feed")
  } else {
    res.redirect("/login")
  }
})
