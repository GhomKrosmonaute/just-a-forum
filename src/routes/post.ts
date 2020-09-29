import db from "../database"
import * as post from "../entities/post"
import * as utils from "../utils"

export default function (req: any, res: any) {
  const data: post.PostData = {
    id: utils.makeId(),
    author_id: req.body.author_id,
    parent_id: req.body.parent_id,
    content: req.body.content,
  }

  if (!data.author_id || !data.parent_id || !data.content) {
    return res.render("pages/error", {
      message: "Invalid request body!",
    })
  }

  const loggedUserId = utils.loggedUserId(req)

  if (data.author_id !== loggedUserId) {
    return res.render("pages/error", {
      message: "Permission error.",
    })
  }

  db.posts.set(data.id, data)

  res.redirect("/wall")
}
