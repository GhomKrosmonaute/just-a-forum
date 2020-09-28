export default function (req: any, res: any) {
  if (req.session?.logged) {
    res.render("pages/wall", {})
  } else {
    res.render("pages/login", {})
  }
}
