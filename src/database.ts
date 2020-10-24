import mysql from "mysql"

export const connection = mysql.createConnection({
  host: "localhost",
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: "forum",
})

connection.connect()

export function query(
  sql: string,
  values: any
): Promise<Results | mysql.FieldInfo[]> {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (error, results: Results, fields) => {
      if (error) return reject(error)
      resolve(fields ?? results)
    })
  })
}

export interface Results {
  insertId?: number
  affectedRows?: number
  [k: string]: any
}
