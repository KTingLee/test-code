import Database from 'better-sqlite3'
import fs from 'fs-extra'
import { execSync } from 'child_process'
import gpg from 'gpg'

const debug = require('debug')('protp:db')

const dbName = 'protp.db'
const dbPath = `/root/proto/${dbName}`

const ENV = process.env.NODE_ENV
const PASSWORD = (ENV === 'production') ? `1234` : `00000`

// init DB
const dbOpt = (process.env.NODE_ENV === 'production') ? { verbose: null } : { verbose: console.log }
const sqlite = new Database(dbName, dbOpt)
sqlite.pragma(`recursive_triggers = ON`)


try {
  // init table
  creatRoleTable()
  creatUserTable()
  creatLogTable()

} catch (error) {
  throw error
}

// init role table
function creatRoleTable () {
  const roleTable = `CREATE TABLE IF NOT EXISTS role (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      title TEXT NOT NULL UNIQUE,
                      permission TEXT NOT NULL
                    )`
  sqlite.prepare(roleTable).run()
}

// init user table
function creatUserTable () {
  const userTable = `CREATE TABLE IF NOT EXISTS user (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      username TEXT NOT NULL UNIQUE,
                      password TEXT NOT NULL,
                      fullname TEXT NOT NULL,
                      email TEXT,
                      role TEXT DEFAULT 'user',
                      FOREIGN KEY("role") REFERENCES "role"("title") ON DELETE SET DEFAULT ON UPDATE CASCADE
                    )`
  sqlite.prepare(userTable).run()
}

// init log table
function creatLogTable () {
  const logTable = `CREATE TABLE IF NOT EXISTS log (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      category TEXT CHECK( category IN ('auth', 'action') ),
                      type TEXT CHECK( type IN ('info', 'warning', 'error') ),
                      user TEXT,
                      msg TEXT,
                      createdAt TEXT NOT NULL DEFAULT (datetime('now','localtime'))
                    )`
  sqlite.prepare(logTable).run()
}

Database.prototype.begin = function () {
  try {
    sqlite.prepare('BEGIN').run()
  } catch (error) {
    this.rollback()
  }
}

Database.prototype.rollback = function () {
  sqlite.prepare('ROLLBACK').run()
}

Database.prototype.commit = function () {
  try {
    sqlite.prepare('COMMIT').run()
  } catch (error) {
    this.rollback()
  }
}

Database.prototype.resetDB = function () {
  try {
    execSync(`rm ${dbPath}`)
  } catch (error) {
    throw error
  }
}

Database.prototype.backupDB = function () {
  try {
    let today = new Date()
    today = today.toISOString().substring(0, 10).replace(/-/g, '')
    const targetFile = `/tmp/Backup_${today}.bk`
    fs.removeSync(targetFile)

    execSync(`/usr/bin/gpg -c --batch --passphrase proto55688 -o ${targetFile} ${dbPath}`)
    return targetFile
  } catch (error) {
    throw error
  }
}

Database.prototype.importDB = async function (fpath) {
  try {
    await importDBFile(fpath)
    fs.copyFileSync(`/tmp/${dbName}`, dbPath)
    debug('import DB file done')
  } catch (error) {
    throw error
  }

  function importDBFile (inputFile) {
    const outputFile = `/tmp/${dbName}`

    return new Promise((resolve, reject) => {
      debug('import: decoder')
      gpg.callStreaming(inputFile, outputFile, ['--passphrase', 'protp55688'], () => {
        const stats = fs.statSync(outputFile)
        if (stats.size === 0) {
          reject(new Error('decode error'))
          return
        }
        resolve()
      })
    })
  }
}

// return [ 'key1 = $key1', 'key2 = $key2', ... ]
Database.prototype.getKeyPair = function (obj) {
  let keyPair = []
  for (const key of Object.keys(obj)) {
    keyPair.push(`${key} = $${key}`)
  }
  return keyPair
}

Database.prototype.listTable = function () {
  const sql = `SELECT name FROM sqlite_master WHERE type = 'table'`
  let results = sqlite.prepare(sql).all()
  results = results.map(table => table.name)
  return results
}

module.exports = exports = sqlite
exports.password = PASSWORD
