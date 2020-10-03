import app from "../server"
import * as entities from "../entities"
import * as utils from "../utils"

app.get("/link/:user_id", function (req: any, res: any) {
  utils.checkoutSession(req, res, (user) => {
    const target_id = req.params.user_id
    const target = entities.User.fromId(target_id)

    if (!target) {
      return utils.error(res, "Unknown target...")
    }

    const userLink = entities.Link.find(
      (data) => data.author_id === user.id && data.target_id === target.id
    )
    const targetLink = entities.Link.find(
      (data) => data.author_id === target.id && data.target_id === user.id
    )

    if (userLink && targetLink) {
      userLink.delete()
      targetLink.delete()
    } else if (userLink) {
      userLink.delete()
    } else {
      const id = utils.makeId()

      const link: entities.LinkData = {
        id,
        author_id: user.id,
        target_id: target.id,
      }

      entities.Link.add(link)
    }

    utils.back(req, res)
  })
})
