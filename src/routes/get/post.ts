import * as db from "../../database"
import * as utils from "../../utils"
import * as user from "../../entities/user"
import * as post from "../../entities/post"

export default function (req: any, res: any) {
  if (req.session?.logged) {
    const user = db.getFullUser(
      db.getUser(utils.loggedUserId(req)) as user.User
    )

    const post_id = req.params.post_id

    if (!post_id) {
      return res.render("pages/error", {
        message: "Ce post n'existe pas.",
      })
    }

    const post = db.getFullPost(db.getPost(post_id) as post.Post)

    res.render("pages/post", { user, post, getFullPost: db.getFullPost })
  } else {
    res.redirect("/")
  }
}
