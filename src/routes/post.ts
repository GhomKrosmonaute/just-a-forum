import app from "../server"
import * as db from "../database"
import * as utils from "../utils"
import * as post from "../entities/post"

const message = "This post no longer exists. <a href='/'>Back to home.</a>"

app.post("/post", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const data: post.PostData = {
      id: utils.makeId(),
      author_id: req.body.author_id,
      parent_id: req.body.parent_id,
      content: req.body.content,
      date: Date.now(),
    }

    if (!data.author_id) {
      return res.render("pages/error", {
        message: "Invalid request body!",
      })
    }

    const loggedUserId = utils.loggedUserId(req)

    if (data.author_id !== loggedUserId) {
      return res.render("pages/error", {
        message: "Permission error.",
      })
    }

    if (!data.content.trim()) {
      return res.render("pages/error", {
        message: "Your post is empty...",
      })
    }

    db.posts.set(data.id, data)

    utils.back(req, res)
  })
})

app.get("/post/:post_id", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const post_id = req.params.post_id

    if (!post_id) {
      return res.render("pages/error", { message })
    }

    const data = db.getPost(post_id)

    if (!data) {
      return res.render("pages/error", { message })
    }

    const post = db.getFullPost(data, true)

    res.render("pages/post", { user, post })
  })
})

app.get("/post/delete/:post_id", function (req, res) {
  utils.checkoutSession(req, res, () => {
    const post_id = req.params.post_id

    if (!post_id) {
      return res.render("pages/error", { message })
    }

    const data = db.posts.get(post_id)

    if (!data) {
      return res.render("pages/error", { message })
    }

    function deleteChildrenOf(post: post.PostData) {
      db.posts.delete(post.id)
      db.posts.forEach((d) => {
        if (d.parent_id === post.id) {
          deleteChildrenOf(d)
        }
      })
    }

    deleteChildrenOf(data)

    utils.back(req, res)
  })
})

app.get("/post/edit/:post_id", (req, res) => {
  utils.checkoutSession(req, res, (user) => {
    // todo : redirect to post editor
  })
})
