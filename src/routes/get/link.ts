import app from "../../server"
import * as db from "../../database"
import * as link from "../../entities/link"
import * as utils from "../../utils"

app.get("/link/:user_id", function (req: any, res: any) {
  utils.checkoutSession(req, res, (user) => {
    const target_id = req.params.user_id

    if (!db.users.has(target_id)) {
      return res.render("pages/error", {
        message: "Unknown user...",
      })
    }

    const target = db.getFullUserById(target_id)

    if (db.areFriends(user, target)) {
      const link = db.links.find(
        (data) => data.author_id === user.id && data.target_id === target.id
      )

      if (link) db.links.delete(link.id)
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
