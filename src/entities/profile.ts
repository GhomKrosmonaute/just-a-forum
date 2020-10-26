import discord from "passport-discord"
import * as database from "../database"
import * as entities from "../entities"

export class Profile extends entities.User {
  constructor(
    data: database.TableData["user"],
    public readonly profile: discord.Profile
  ) {
    super(data)
  }
  get avatar() {
    return this.profile.avatar
  }
  get discriminator() {
    return this.profile.discriminator
  }
  get fetchedAt() {
    return this.profile.fetchedAt
  }
  get flags() {
    return this.profile.flags
  }
  get locale() {
    return this.profile.locale
  }
  get username() {
    return this.profile.username
  }
  get verified() {
    return this.profile.verified
  }
}
