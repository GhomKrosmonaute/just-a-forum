import * as entities from "../entities"
import * as utils from "../utils"
import app from "../server"

const ss = require("string-similarity")

app.post("/search", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const search = req.body.search?.trim() ?? ""
    res.redirect("/search/" + search)
  })
})

app.get("/search/:search", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const search = req.params.search?.trim()
    searching(req, res, user, search)
  })
})

function searching(req: any, res: any, user: entities.User, search: string) {
  if (search.trim().length === 0) {
    return utils.error(res, "Invalid search...")
  }

  const pageIndex = Number(req.query.page ?? 0)

  const results = {
    posts: utils.paginate(
      entities.Post.sort((d1, d2) => {
        return (
          ss.compareTwoStrings(d2.content, search) -
          ss.compareTwoStrings(d1.content, search)
        )
      }, 66),
      pageIndex
    ),

    users: entities.User.sort((d1, d2) => {
      return (
        ss.compareTwoStrings(d2.username, search) -
        ss.compareTwoStrings(d1.username, search)
      )
    }, 20),
  }

  utils.page(req, res, "search", { user, search, results, pageIndex })
}
