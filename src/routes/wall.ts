export default function (req: any, res: any) {
  if (req.session?.logged) {
    res.render("pages/wall", {})
  } else {
    res.render("pages/error", {
      message: "You can't reach this endpoint before login.",
    })
  }
}
