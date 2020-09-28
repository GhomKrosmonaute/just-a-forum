export default function (req: any, res: any) {
  if (req.session?.logged) {
    res.redirect("/wall")
  } else {
    res.render("pages/login", {})
  }
}
