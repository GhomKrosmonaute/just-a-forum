export function makeId(): string {
  return String(Date.now().toString(16) + ":" + Math.random().toString(16))
}

export function logUser(req: any, user_id: string) {
  req.session.logged = true
  req.session.user_id = user_id
}

export function loggedUserId(req: any): string {
  if (!req.session.user_id) throw Error("unknown session")
  return req.session.user_id
}
