import faker from "faker"
import app from "../server"
import * as utils from "../utils"
import * as entities from "../entities"

app.get("/admin", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    if (!user.admin) {
      return utils.error(res, "Access denied.")
    }
    utils.page(req, res, "admin", { user, entities })
  })
})

app.get("/clean", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    if (!user.admin) {
      return utils.error(res, "Access denied.")
    }

    entities.User.db.forEach((data) => {
      if (data.id !== user.id) {
        new entities.User(data).delete()
      }
    })

    res.redirect("/admin")
  })
})

app.post("/fake", function (req, res) {
  utils.checkoutSession(req, res, async (user) => {
    if (!user.admin) {
      return utils.error(res, "Access denied.")
    }

    const userCount = req.body.users ?? 100
    const postCountPerUser = req.body.posts ?? 100

    const password = await utils.hash(res, "password")

    for (let u = 0; u < userCount; u++) {
      const user_id = utils.makeId()

      entities.User.add({
        id: user_id,
        username: faker.internet.userName(),
        password: password as string,
        shortcuts: [],
      })

      for (let p = 0; p < postCountPerUser; p++) {
        const post_id = utils.makeId()

        let parent_id = null
        if (Math.random() < 0.5) {
          const parent = entities.Post.db.random()
          if (parent) {
            parent_id = parent.id
          }
        }

        entities.Post.add({
          id: post_id,
          author_id: user_id,
          content: faker.lorem.sentences(),
          date: faker.date.past().getTime(),
          parent_id,
        })
      }
    }

    res.redirect("/admin")
  })
})
