import * as entities from "../entities"
import * as utils from "../utils"
import app from "../server"

app.post("/search", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const search = req.body.search?.trim()
    searching(req, res, user, search)
  })
})

app.get("/search/:search", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const search = req.params.search?.trim()
    searching(req, res, user, search)
  })
})

function searching(req: any, res: any, user: entities.User, search: string) {
  if (!search) {
    return utils.back(req, res)
  }

  const results = {
    posts: entities.Post.filter((data) => {
      return data.content.toLowerCase().includes(search.toLowerCase())
    }).sort(utils.sortByDate),

    users: entities.User.filter((data) => {
      return data.username.toLowerCase().includes(search.toLowerCase())
    }),
  }

  utils.page(req, res, "search", { user, search, results })
}
