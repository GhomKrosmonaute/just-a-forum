import express from "express"
import app from "../server"
import * as utils from "../utils"
import * as entities from "../entities"

app.get("/post", utils.back)

app.post("/post", function (req, res) {
  utils.checkoutSession(req, res, async (user) => {
    const content = req.body.content?.trim()

    if (!content) {
      return utils.error(res, "Your post is empty...")
    }

    if (content.length > 1024) {
      return utils.error(res, "Your post is too large")
    }

    await entities.Post.db.push({
      author_id: user.id,
      parent_id: req.body.parent_id,
      content,
      created_timestamp: Date.now(),
      edited_timestamp: Date.now(),
    })

    utils.back(req, res)
  })
})

app.get("/post/:post_id", function (req, res) {
  utils.checkoutSession(req, res, async (user) => {
    const post = await utils.getEntityFromParam<entities.Post>(req, res, "Post")

    if (!post) return

    const pageIndex = Number(req.query.page ?? 0)

    utils.page(req, res, "post", { user, post, pageIndex })
  })
})

app.get("/post/delete/:post_id", function (req, res) {
  utils.checkoutSession(req, res, async (user) => {
    const post = await utils.getEntityFromParam<entities.Post>(req, res, "Post")

    if (!post) return

    if (post.author_id !== user.id && !user.admin) {
      return utils.error(res, "Permission error.")
    }

    await post.delete()

    utils.back(req, res)
  })
})

app.get("/post/edit/:post_id", (req, res) => {
  utils.checkoutSession(req, res, async (user) => {
    const post = await utils.getEntityFromParam<entities.Post>(req, res, "Post")

    if (!post) return

    utils.page(req, res, "post-editor", { post, user })
  })
})

app.post("/post/edit/:post_id", (req, res) => {
  utils.checkoutSession(req, res, async (user) => {
    const post = await utils.getEntityFromParam<entities.Post>(req, res, "Post")

    if (!post) return

    if (post.author_id !== user.id && !user.admin) {
      return utils.error(res, "Permission error.")
    }

    post.content = req.body.content ?? ""

    if (!post.content.trim()) {
      return utils.error(res, "Your post is empty...")
    }

    await entities.Post.db.push(post.data)

    res.redirect("/post/" + post.id)
  })
})

app.get("/posts/:user_id", function (req, res) {
  utils.checkoutSession(req, res, async (user) => {
    const target = await utils.getEntityFromParam<entities.User>(
      req,
      res,
      "User"
    )

    if (!target) return

    const pageIndex = Number(req.query.page ?? 0)

    utils.page(req, res, "posts", { user, target, pageIndex })
  })
})
