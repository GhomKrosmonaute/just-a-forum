import * as user from "../../entities/user"
import * as utils from "../../utils"
import * as db from "../../database"

export default function (req: any, res: any) {
  if (req.session?.logged) {
    const user = db.getFullUser(
      db.getUser(utils.loggedUserId(req)) as user.User
    )
    res.render("pages/wall", { user, getFullPost: db.getFullPost })
  } else {
    res.redirect("/")
  }
}
