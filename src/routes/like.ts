import app from "../server"
import * as entities from "../entities"
import * as utils from "../utils"

app.get("/like", utils.back)

app.get("/like/:post_id", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    like(req, res, user, req.params.post_id)
  })
})

app.post("/like", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    if (!req.body.post_id) {
      return utils.error(res, "Invalid request body!")
    }

    like(req, res, user, req.body.post_id)
  })
})

function like(req: any, res: any, user: entities.User, post_id: string) {
  const id = utils.makeId()

  const data: entities.LikeData = {
    id,
    user_id: user.id,
    post_id: post_id,
  }

  // post exists?
  if (!entities.Post.db.has(post_id)) {
    return utils.error(res, "Incorrect post id!")
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
}
