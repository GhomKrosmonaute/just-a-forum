import Enmap from "enmap"
import * as entities from "../entities"

export interface ShortcutData {
  id: string
  input: string
  output: string
}

export class Shortcut implements ShortcutData {
  static db = new Enmap<string, ShortcutData>({ name: "shortcuts" })

  public id: string
  public input: string
  public output: string

  constructor(data: ShortcutData) {
    this.id = data.id
    this.input = data.input
    this.output = data.output
  }

  get data(): ShortcutData {
    return {
      id: this.id,
      input: this.input,
      output: this.output,
    }
  }

  static fromId(id: string): Shortcut | void {
    const data = this.db.get(id)
    if (!data) return
    return new Shortcut(data)
  }

  static find(finder: (data: ShortcutData) => boolean): Shortcut | void {
    const data = this.db.find(finder)
    if (!data) return
    return new Shortcut(data)
  }

  static sort(
    sorter: (d1: ShortcutData, d2: ShortcutData) => number,
    limit?: number
  ): Shortcut[] {
    const sorted = this.db.array().sort(sorter)
    const data = limit ? sorted.slice(0, limit) : sorted
    return data.map((d) => new Shortcut(d))
  }

  static filter(filter: (data: ShortcutData) => boolean): Shortcut[] {
    return this.db.filterArray(filter).map((data) => new Shortcut(data))
  }

  static add(data: ShortcutData) {
    this.db.set(data.id, data)
  }

  getUsers(): entities.User[] {
    return entities.User.filter((data) => !!data?.shortcuts?.includes(this.id))
  }

  delete() {
    this.getUsers().forEach((user) => user.deleteShortcut(this.id))
    Shortcut.db.delete(this.id)
  }

  patch(data: ShortcutData) {
    if (data.id !== this.id) {
      throw new Error("oops")
    }
    this.output = data.output
    this.input = data.input
    Shortcut.db.set(data.id, data)
  }
}
