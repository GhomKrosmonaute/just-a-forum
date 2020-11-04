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
  utils.checkoutSession(req, res, async (user) => {
    if (!user.admin) {
      return utils.error(res, "Access denied.")
    }

    await entities.User.db.deleteFilter("fake = 1")

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

    for (let u = 0; u < userCount; u++) {
      const insertId = await entities.User.db.push({
        fake: true,
        snowflake: utils.makeId(),
        display_name: faker.internet.userName(),
        description: faker.lorem.lines(),
        created_timestamp: faker.date.past().getTime(),
      })

      if (insertId) {
        for (let p = 0; p < postCountPerUser; p++) {
          let parent_id = null
          if (Math.random() < 0.5) {
            const parent = await entities.Post.db.random()
            if (parent) {
              parent_id = parent.id
            }
          }

          await entities.Post.db.push({
            author_id: insertId,
            content: faker.lorem.lines(),
            created_timestamp: faker.date.past().getTime(),
            edited_timestamp: Date.now(),
            parent_id,
          })
        }
      }
    }

    res.redirect("/admin")
  })
})
