import app from "../server"
import * as entities from "../entities"
import * as utils from "../utils"

app.get("/like", utils.back)

app.post("/like", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    if (!req.body.post_id) {
      return utils.error(res, "Invalid request body!")
    }

    const id = utils.makeId()

    const data: entities.LikeData = {
      id,
      user_id: user.id,
      post_id: req.body.post_id,
    }

    const similarLike = entities.Like.find(
      (d) => d.post_id === data.post_id && d.user_id === data.user_id
    )

    // if already liked
    if (similarLike) {
      similarLike.delete()
    } else {
      entities.Like.add(data)
    }

    utils.back(req, res)
  })
})
