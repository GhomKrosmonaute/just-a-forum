import app from "../server"
import * as database from "../database"
import * as entities from "../entities"
import * as utils from "../utils"

app.get("/favorite", utils.back)

app.get("/favorite/:post_id", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    if (!/^\d+$/.test(req.params.post_id)) {
      return utils.error(res, "Invalid ID parameter")
    }

    const post_id = Number(req.params.post_id)

    favorite(req, res, user, post_id).catch((error) => {
      utils.error(res, "Unknown error...")
      throw error
    })
  })
})

app.post("/favorite", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    if (!req.body.post_id) {
      return utils.error(res, "Invalid request body!")
    }

    favorite(req, res, user, req.body.post_id).catch((error) => {
      utils.error(res, "Unknown error...")
      throw error
    })
  })
})

async function favorite(
  req: any,
  res: any,
  user: entities.User,
  post_id: number
) {
  const data: Omit<database.TableData["favorite"], "id"> = {
    post_id,
    user_id: user.id,
    created_timestamp: Date.now(),
  }

  // post exists?
  if (!(await entities.Post.db.has("id = ?", [post_id]))) {
    return utils.error(res, "Incorrect post id!")
  }

  const similarLike = await entities.Favorite.find(
    `post_id = ? AND user_id = ?`,
    [data.post_id, data.user_id]
  )

  // if already liked
  if (similarLike) {
    await similarLike.delete()
  } else {
    await entities.Favorite.db.push(data)
  }

  utils.back(req, res)
}
