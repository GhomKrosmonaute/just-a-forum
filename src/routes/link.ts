import app from "../server"
import * as db from "../database"
import * as link from "../entities/link"
import * as utils from "../utils"

app.get("/link/:user_id", function (req: any, res: any) {
  utils.checkoutSession(req, res, (user) => {
    const target_id = req.params.user_id

    if (!db.users.has(target_id)) {
      return res.render("pages/error", {
        message: "Unknown user...",
      })
    }

    const target = db.getFullUserById(target_id)

    const userLink = db.links.find(
      (data) => data.author_id === user.id && data.target_id === target.id
    )
    const targetLink = db.links.find(
      (data) => data.author_id === target.id && data.target_id === user.id
    )

    if (userLink && targetLink) {
      db.links.delete(userLink.id)
      db.links.delete(targetLink.id)
    } else if (userLink) {
      db.links.delete(userLink.id)
    } else {
      const id = utils.makeId()

      const link: link.LinkData = {
        id,
        author_id: user.id,
        target_id: target.id,
      }

      db.links.set(id, link)
    }

    utils.back(req, res)
  })
})
