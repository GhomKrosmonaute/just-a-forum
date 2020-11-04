import app from "../server"
import * as entities from "../entities"
import * as utils from "../utils"

app.get("/friendRequest/:user_id", function (req: any, res: any) {
  utils.checkoutSession(req, res, async (user) => {
    const target_id = req.params.user_id
    const target = await entities.User.fromId(target_id)

    if (!target) {
      return utils.error(res, "Unknown target...")
    }

    const userFriendRequest = await entities.FriendRequest.find(
      "author_id = ? AND target_id = ?",
      [user.id, target.id]
    )
    const targetFriendRequest = await entities.FriendRequest.find(
      "author_id = ? AND target_id = ?",
      [target.id, user.id]
    )

    if (userFriendRequest && targetFriendRequest) {
      await userFriendRequest.delete()
      await targetFriendRequest.delete()
    } else if (userFriendRequest) {
      await userFriendRequest.delete()
    } else {
      await entities.FriendRequest.db.push({
        author_id: user.id,
        target_id: target.id,
        created_timestamp: Date.now(),
      })
    }

    utils.back(req, res)
  })
})
