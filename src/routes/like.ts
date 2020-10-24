import app from "../server"
import * as entities from "../entities"
import * as utils from "../utils"

app.get("/like", utils.back)

app.get("/like/:post_id", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    like(req, res, user, req.params.post_id).catch((error) => {
      utils.error(res, "Unknown error...")
      throw error
    })
  })
})

app.post("/like", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    if (!req.body.post_id) {
      return utils.error(res, "Invalid request body!")
    }

    like(req, res, user, req.body.post_id).catch((error) => {
      utils.error(res, "Unknown error...")
      throw error
    })
  })
})

async function like(req: any, res: any, user: entities.User, post_id: string) {
  const data: entities.FavoriteDataOnly = {
    user_id: user.id,
    post_id: post_id,
    created_timestamp: Date.now(),
  }

  // post exists?
  if (!entities.Post.db.has(post_id)) {
    return utils.error(res, "Incorrect post id!")
  }

  const similarLike = await entities.Favorite.find(
    `post_id = ? AND user_id = ?`,
    [data.post_id, data.user_id]
  )

  // if already liked
  if (similarLike) {
    similarLike.delete()
  } else {
    await entities.Favorite.db.push(data)
  }

  utils.back(req, res)
}
