import app from "../server"
import * as utils from "../utils"
import * as entities from "../entities"

const message = "This post no longer exists or the given ID is incorrect."

app.get("/post", utils.back)

app.post("/post", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const data: entities.PostData = {
      id: utils.makeId(),
      author_id: user.id,
      parent_id: req.body.parent_id,
      content: req.body.content?.trim(),
      date: Date.now(),
    }

    if (!data.content) {
      return utils.error(res, "Your post is empty...")
    }

    data.content = utils.md.render(data.content)

    if (data.content.length > 1024) {
      return utils.error(res, "Your post is too large")
    }

    entities.Post.add(data)

    utils.back(req, res)
  })
})

app.get("/post/:post_id", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const post = entities.Post.fromId(req.params.post_id)

    if (!post) {
      return utils.error(res, message)
    }

    utils.page(req, res, "post", { user, post })
  })
})

app.get("/post/delete/:post_id", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const post = entities.Post.fromId(req.params.post_id)

    if (!post) {
      return utils.error(res, message)
    }

    if (post.author_id !== user.id && !user.admin) {
      return utils.error(res, "Permission error.")
    }

    post.delete()

    utils.back(req, res)
  })
})

app.get("/post/edit/:post_id", (req, res) => {
  utils.checkoutSession(req, res, (user) => {
    const post = entities.Post.fromId(req.params.post_id)

    if (!post) {
      return utils.error(res, message)
    }

    utils.page(req, res, "post-editor", { post, user })
  })
})

app.post("/post/edit/:post_id", (req, res) => {
  utils.checkoutSession(req, res, (user) => {
    const post = entities.Post.fromId(req.params.post_id)

    if (!post) {
      return utils.error(res, message)
    }

    if (post.author_id !== user.id && !user.admin) {
      return utils.error(res, "Permission error.")
    }

    post.content = req.body.content ?? ""

    if (!post.content.trim()) {
      return utils.error(res, "Your post is empty...")
    }

    post.content = utils.md.render(post.content)

    entities.Post.add(post.data)

    res.redirect("/post/" + post.id)
  })
})
