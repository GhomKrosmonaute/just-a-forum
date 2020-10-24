import mysql from "mysql"
import * as entities from "./entities"
import { type } from "os"

export const connection = mysql.createConnection({
  host: "localhost",
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: "forum",
})

connection.connect()

export function query<T = mysql.FieldInfo>(
  sql: string,
  values: any
): Promise<Results<T>> {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (error, results) => {
      if (error) return reject(error)
      resolve(results)
    })
  })
}

export class Database<N extends TableName> {
  constructor(public table: N) {}

  query(sql: string, values: any) {
    return query<Tables[N]>(sql, values)
  }

  async delete(id: number): Promise<void> {
    await this.query(`DELETE FROM ${this.table} WHERE id = ?`, [id])
  }

  get(id: number): Promise<Tables[N] | undefined> {
    return this.query(`SELECT * FROM ${this.table} WHERE id = ? LIMIT 1`, [
      id,
    ]).then((results) => results[0])
  }

  push(data: Omit<Tables[N], "id">): Promise<number | undefined> {
    return this.query(`INSERT INTO ${this.table} SET ?`, data).then(
      (results) => results.insertId
    )
  }

  find(filter: string, values?: any): Promise<Tables[N] | undefined> {
    return this.filter(filter, values).then((results) => results[0])
  }

  filter(filter: string, values?: any): Promise<Tables[N][]> {
    return this.query(`SELECT * FROM ${this.table} WHERE ${filter}`, values)
  }

  count(filter: string, values?: any): Promise<number> {
    return this.query(
      `SELECT COUNT(*) AS count FROM ${this.table} WHERE ${filter}`,
      values
    ).then((results) => results[0].count ?? 0)
  }

  has(filter: string, values?: any): Promise<boolean> {
    return this.count(filter, values).then((count) => count > 0)
  }
}

export type Results<T> = Row<T>[] & {
  insertId?: number
  affectedRows?: number
}

export type Row<T> = T & {
  count?: number
}

export interface Tables {
  favorite: entities.FavoriteData
  friend_request: entities.LinkData
  post: entities.PostData
  notification: null
  message: null
  report: null
  shortcut: entities.ShortcutData
  user: entities.UserData
}

export type TableName = keyof Tables
