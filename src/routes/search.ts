import * as db from "../database"
import * as utils from "../utils"
import app from "../server"

app.post("/search", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const search = req.body.search?.trim()

    if (!search) {
      return utils.back(req, res)
    }

    const results = {
      posts: db.posts
        .filterArray((data) => {
          return data.content.toLowerCase().includes(search.toLowerCase())
        })
        .map((data) => db.getFullPostById(data.id, true)),

      users: db.users
        .filterArray((data) => {
          return data.username.toLowerCase().includes(search.toLowerCase())
        })
        .map((data) => db.getFullUserById(data.id)),
    }

    utils.page(req, res, "search", { user, search, results })
  })
})
