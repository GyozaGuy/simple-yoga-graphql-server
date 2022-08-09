import sqlite3 from 'sqlite3'

let db

export function createTableUnlessExists(tableName, definition) {
  return new Promise((resolve, reject) => {
    try {
      openDb()

      db.serialize(() => {
        db.run(
          `CREATE TABLE IF NOT EXISTS ${tableName} (${Object.entries(
            definition
          ).reduce(
            (acc, [key, value]) => `${acc ? `${acc}, ` : ''}${key} ${value}`,
            ''
          )})`
        )

        resolve()
      })
    } catch (err) {
      console.error(err)
      reject(err)
    } finally {
      db.close()
    }
  })
}

export function deleteFromTable(tableName, keyValues) {
  return new Promise((resolve, reject) => {
    try {
      openDb()

      const keyValueString = makeKeyValueString(keyValues)

      db.serialize(() => {
        db.run(`DELETE FROM ${tableName} WHERE ${keyValueString}`)
      })

      resolve()
    } catch (err) {
      console.error(err)
      reject(err)
    } finally {
      db.close()
    }
  })
}

export function getByValuesFromTable(tableName, keyValues) {
  return new Promise((resolve, reject) => {
    try {
      openDb()

      const keyValueString = makeKeyValueString(keyValues)

      db.serialize(() => {
        db.get(
          `SELECT * FROM ${tableName} WHERE ${keyValueString}`,
          (_err, row) => {
            resolve(row)
          }
        )
      })
    } catch (err) {
      console.error(err)
      reject(err)
    } finally {
      db.close()
    }
  })
}

export function insertValuesIntoTable(tableName, values) {
  return new Promise((resolve, reject) => {
    try {
      openDb()

      db.serialize(() => {
        const stmt = db.prepare(
          `INSERT INTO ${tableName} (${Object.keys(values).join(
            ', '
          )}) VALUES (${Array(Object.values(values).length)
            .fill()
            .map(() => '?')
            .join(', ')})`
        )

        stmt.run(Object.values(values))
        stmt.finalize()

        resolve()
      })
    } catch (err) {
      console.error(err)
      reject(err)
    } finally {
      db.close()
    }
  })
}

function makeKeyValueString(keyValues) {
  return Object.entries(keyValues).reduce((acc, [key, value]) => {
    return `${acc ? `${acc} AND ` : ''}${key} = '${value}'`
  }, '')
}

function openDb() {
  db = new sqlite3.Database('db.sqlite')
}

export function updateTable(tableName, newKeyValues, oldKeyValues) {
  return new Promise((resolve, reject) => {
    try {
      openDb()

      const newKeyValueString = makeKeyValueString(newKeyValues)
      const oldKeyValueString = makeKeyValueString(oldKeyValues)

      db.serialize(() => {
        db.run(
          `UPDATE ${tableName} SET ${newKeyValueString} WHERE ${oldKeyValueString}`
        )
      })

      resolve()
    } catch (err) {
      console.error(err)
      reject(err)
    } finally {
      db.close()
    }
  })
}

export default {
  createTableUnlessExists,
  deleteFromTable,
  getByValuesFromTable,
  insertValuesIntoTable,
  updateTable
}
