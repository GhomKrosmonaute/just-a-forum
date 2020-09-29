import * as like from "../entities/like"
import * as utils from "../utils"
import * as db from "../database"

export default function (req: any, res: any) {
  const id = utils.makeId()

  const data: like.LikeData = {
    id,
    user_id: req.body.user_id,
    post_id: req.body.post_id,
  }

  if (!data.user_id || !data.post_id) {
    return res.render("pages/error", {
      message: "Invalid request body!",
    })
  }

  const loggedUserId = utils.loggedUserId(req)

  if (data.user_id !== loggedUserId) {
    return res.render("pages/error", {
      message: "Permission error.",
    })
  }

  db.likes.set(id, data)

  res.redirect("/wall")
}
