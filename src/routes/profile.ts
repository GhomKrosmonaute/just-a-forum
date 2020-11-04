import app from "../server"
import * as utils from "../utils"
import * as entities from "../entities"

app.get("/profile", function (req, res) {
  utils.checkoutSession(req, res, (user) => {
    utils.page(req, res, "profile", { user, target: user })
  })
})

app.get("/profile/:user_id", function (req, res) {
  utils.checkoutSession(req, res, async (user) => {
    const target = await utils.getEntityFromParam<entities.User>(
      req,
      res,
      "User"
    )

    if (!target) return

    utils.page(req, res, "profile", { user, target })
  })
})

app.post("/profile/:user_id", function (req, res) {
  utils.checkoutSession(req, res, async (user) => {
    const target = await utils.getEntityFromParam<entities.User>(
      req,
      res,
      "User"
    )

    // check param

    if (!target) return

    // check user permission

    if (user.id !== target.id && !user.admin) {
      return utils.error(res, "Permission error.")
    }

    // check form data

    const display_name = req.body.display_name ?? null
    const description = req.body.description ?? null

    utils.validateDisplayName(res, display_name, async () => {
      // patch

      await target.patch({
        id: target.id,
        fake: target.fake,
        snowflake: target.snowflake,
        display_name,
        description,
      })

      // render

      utils.page(req, res, "profile", { user, target })
    })
  })
})
