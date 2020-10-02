import app from "../server"
import * as db from "../database"
import * as utils from "../utils"
import * as post from "../entities/post"

const message = "This post no longer exists or the given ID is incorrect."

app.post("/post", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    const data: post.PostData = {
      id: utils.makeId(),
      author_id: user.id,
      parent_id: req.body.parent_id,
      content: req.body.content,
      date: Date.now(),
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

    function deleteChildrenOf(d: post.PostData) {
      db.posts.delete(d.id)
      db.posts.forEach((d) => {
        if (d.parent_id === d.id) {
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
    const post_id = req.params.post_id

    if (!post_id) {
      return res.render("pages/error", { message })
    }

    const data = db.posts.get(post_id)

    if (!data) {
      return res.render("pages/error", { message })
    }

    const post = db.getFullPostById(data.id, true)

    res.render("pages/post-editor", { post, user })
  })
})

app.post("/post/edit/:post_id", (req, res) => {
  utils.checkoutSession(req, res, (user) => {
    const post_id = req.params.post_id

    if (!post_id) {
      return res.render("pages/error", { message })
    }

    const data = db.posts.get(post_id)

    if (!data) {
      return res.render("pages/error", { message })
    }

    data.content = req.body.content ?? ""

    if (!data.content.trim()) {
      return res.render("pages/error", {
        message: "Your post is empty...",
      })
    }

    db.posts.set(data.id, data)

    const post = db.getFullPostById(data.id)

    res.render("pages/post", { user, post })
  })
})
