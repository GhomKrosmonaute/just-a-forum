import * as db from "../../database"
import * as post from "../../entities/post"
import * as utils from "../../utils"

export default function (req: any, res: any) {
  const redirect = req.body.redirect ?? "/wall"

  const data: post.PostData = {
    id: utils.makeId(),
    author_id: req.body.author_id,
    parent_id: req.body.parent_id,
    content: req.body.content,
    date: Date.now(),
  }

  if (!data.author_id) {
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

  if (!data.content.trim()) {
    return res.render("pages/error", {
      message: "Your post is empty...",
    })
  }

  db.posts.set(data.id, data)

  res.redirect(redirect)
}
