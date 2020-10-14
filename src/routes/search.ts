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

  if (search.startsWith("===")) {
    search = search.slice(3)
    req.query.strategy = "exact"
  }

  if (search.startsWith("==")) {
    search = search.slice(2)
    req.query.strategy = "strict"
  }

  if (search.startsWith("=")) {
    search = search.slice(1)
  }

  const pageIndex = Number(req.query.page ?? 0)
  const strategy: "strict" | "clever" | "exact" =
    req.query.strategy ?? req.body.strategy ?? "clever"

  const sorter = (prop: string) => ss.compareTwoStrings(prop, search)

  const users = entities.User.sort((a, b) => {
    return sorter(b.username) - sorter(a.username)
  }, 20)

  const posts =
    strategy === "strict"
      ? entities.Post.filter((data) =>
          data.content.toLowerCase().includes(search.toLowerCase())
        )
          .sort((a, b) => sorter(b.content) - sorter(a.content))
          .slice(0, 66)
      : strategy === "exact"
      ? entities.Post.filter((data) => data.content.includes(search))
          .sort((a, b) => sorter(b.content) - sorter(a.content))
          .slice(0, 66)
      : entities.Post.sort((a, b) => sorter(b.content) - sorter(a.content), 66)

  const postPagination = utils.paginate(posts, pageIndex)

  utils.page(req, res, "search", {
    user,
    search,
    pageIndex,
    results: { posts: postPagination, users },
  })
}
