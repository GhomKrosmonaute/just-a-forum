import passport from "passport"
import app from "../server"

app.get("/auth/discord", passport.authenticate("discord"))
app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/",
  }),
  function (req, res) {
    res.redirect("/feed")
  }
)
