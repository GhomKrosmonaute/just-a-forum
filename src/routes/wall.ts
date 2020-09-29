import * as user from "../entities/user"
import * as utils from "../utils"
import * as db from "../database"

export default function (req: any, res: any) {
  if (req.session?.logged) {
    const user = db.getFullUser(
      db.getUser(utils.loggedUserId(req)) as user.User
    )
    const posts = db.getUserWallPosts(user)
    res.render("pages/wall", { user, posts })
  } else {
    res.render("pages/error", {
      message: "You can't reach this endpoint before login.",
    })
  }
}
