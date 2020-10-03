import * as entities from "../entities"
import * as utils from "../utils"
import app from "../server"

app.post("/search", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const search = req.body.search?.trim()

    if (!search) {
      return utils.back(req, res)
    }

    const results = {
      posts: entities.Post.filter((data) => {
        return data.content.toLowerCase().includes(search.toLowerCase())
      }),

      users: entities.User.filter((data) => {
        return data.username.toLowerCase().includes(search.toLowerCase())
      }),
    }

    utils.page(req, res, "search", { user, search, results })
  })
})
