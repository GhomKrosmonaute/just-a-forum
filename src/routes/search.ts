import * as entities from "../entities"
import * as utils from "../utils"
import app from "../server"

const ss = require("string-similarity")

app.post("/search", function (req, res) {
  const search = req.body.search?.trim() ?? ""
  res.redirect("/search/" + search)
})

app.get("/search/:search", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const search = req.params.search?.trim() ?? ""
    searching(req, res, user, search)
  })
})

function searching(req: any, res: any, user: entities.User, search: string) {
  if (search.trim().length === 0) {
    return utils.error(res, "Invalid search...")
  }

  if (search.startsWith("=")) {
    search = search.slice(1)
    req.query.strategy = "strict"
  }

  const pageIndex = Number(req.query.page ?? 0)
  const strategy: "strict" | "clever" =
    req.query.strategy || req.body.strategy || "clever"
  const comparator =
    strategy === "strict"
      ? (prop: string) => ss.compareTwoStrings(prop, search)
      : (prop: string) => prop.toLowerCase().includes(search.toLowerCase())

  const results = {
    posts: utils.paginate(
      entities.Post.sort((d1, d2) => {
        return comparator(d2.content) - comparator(d1.content)
      }, 66),
      pageIndex
    ),

    users: entities.User.sort((d1, d2) => {
      return comparator(d2.username) - comparator(d1.username)
    }, 20),
  }

  utils.page(req, res, "search", { user, search, results, pageIndex })
}
