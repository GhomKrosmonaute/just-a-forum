import mysql from "mysql"

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
    return query<TableData[N]>(sql, values)
  }

  async delete(id: number): Promise<void> {
    await this.query(`DELETE FROM ${this.table} WHERE id = ?`, [id])
  }

  get(id: number): Promise<TableData[N] | undefined> {
    return this.query(`SELECT * FROM ${this.table} WHERE id = ? LIMIT 1`, [
      id,
    ]).then((results) => results[0])
  }

  push(data: Omit<TableData[N], "id">): Promise<number | undefined> {
    return this.query(`INSERT INTO ${this.table} SET ?`, data).then(
      (results) => results.insertId
    )
  }

  find(filter: string, values?: any): Promise<TableData[N] | undefined> {
    return this.filter(filter, values).then((results) => results[0])
  }

  filter(filter: string, values?: any): Promise<TableData[N][]> {
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

export type Row<T> = T & {
  count?: number
}

export type Results<T> = Row<T>[] & {
  insertId?: number
  affectedRows?: number
}

export interface Data {
  id: number
  created_timestamp: number
}

export interface TableData {
  favorite: Data & {
    user_id: number
    post_id: number
  }
  friend_request: Data & {
    author_id: number
    target_id: number
  }
  post: Data & {
    author_id: number
    parent_id: number | null
    content: string
    edited_timestamp: number
  }
  notification: Data & {
    target_id: number
    title: string
    content: string
    post_id: number | null
    user_id: number | null
    report_id: number | null
    shortcut_id: number | null
    message_id: number | null
  }
  message: Data & {
    author_id: number
    target_id: number
    content: string
    edited_timestamp: number
  }
  report: Data & {
    author_id: number
    reason: string
    user_id: number | null
    post_id: number | null
    shortcut_id: number | null
    message_id: number | null
  }
  shortcut: Data & {
    user_id: number
    input: string
    output: string
  }
  user: Data & {
    snowflake: string
    description: string
    display_name: string
  }
}

export type TableName = keyof TableData
