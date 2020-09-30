import app from "../../server"
import * as db from "../../database"
import * as utils from "../../utils"

app.get("/post/:post_id", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const post_id = req.params.post_id

    if (!post_id) {
      return res.render("pages/error", {
        message: "Ce post n'existe pas.",
      })
    }

    const data = db.getPost(post_id)

    if (!data) {
      return res.render("pages/error", {
        message: "Ce post n'existe pas.",
      })
    }

    const post = db.getFullPost(data)

    res.render("pages/post", { user, post, getFullPost: db.getFullPost })
  })
})
