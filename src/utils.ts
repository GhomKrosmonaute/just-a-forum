import argon from "argon2"

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

export async function parseLogin(
  req: any
): Promise<{
  username: string
  hash: string
} | null> {
  const username: string = escape(req.body.username)
  const password: string = req.body.password

  if (!username || !password) return null

  const hash = await argon.hash(password, {
    salt: Buffer.from(process.env.HASH_SALT as string),
  })

  return {
    username,
    hash,
  }
}
