import app from "../server"
import * as like from "../entities/like"
import * as utils from "../utils"
import * as db from "../database"

app.get("/like", function (req, res) {
  utils.back(req, res)
})

app.post("/like", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const id = utils.makeId()

    const data: like.LikeData = {
      id,
      user_id: req.body.user_id,
      post_id: req.body.post_id,
    }

    if (!data.user_id || !data.post_id) {
      return utils.error(res, "Invalid request body!")
    }

    const loggedUserId = utils.loggedUserId(req)

    if (data.user_id !== loggedUserId) {
      return utils.error(res, "Permission error.")
    }

    const similarLike = db.likes.find(
      (d) => d.post_id === data.post_id && d.user_id === data.user_id
    )

    // if already liked
    if (similarLike) {
      db.likes.delete(similarLike.id)
    } else {
      db.likes.set(id, data)
    }

    utils.back(req, res)
  })
})
