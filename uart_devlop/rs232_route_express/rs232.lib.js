import { EventEmitter } from 'events'
import SerialPort from 'serialport'
import util from 'util'
import os from 'os'
import Readline from '@serialport/parser-readline'
import pathRegexp from 'path-to-regexp'

const debug = require('debug')('bxb:rs232')
const SerialPortPath = os.platform() === 'linux' ? '/dev/ttyS1' : '/dev/tty.usbserial-14410'

const METHODS = ['get', 'set']
const DELIMITER = '\r\n'

// RS232 物件負責建立 rs232 io 物件，並製作 parse 處理收到的訊號
const Rs232 = function () {
  this.port = null
  this.parser = null
  this.routeStacks = []

  this.init()
}

Rs232.prototype.init = function () {
  if (os.platform() === 'darwin') return
  this.port = new SerialPort(SerialPortPath, { baudRate: 9600 })
  this.parser = new Readline('\r\n')

  this.port.on('open', err => {
    if (err) debug(err)
    debug('rs232 opened')
    this.port.pipe(this.parser)
  })

  // 資料格式 Route,Action,Item[,Param]
  // e.g  system,get,schedule  ,  templates,set,current,3
  // 但可能要訂一個 protocol，確定資料接收的長度正確，例如有一個 header 說這串指令多長之類的
  this.parser.on('data', data => {
    debug('Recv data: ', data.toString())

    const separated = data.toString().split(DELIMITER)
    separated.forEach(msg => {
      if (msg === '') return

      this.dataHandler(msg)
    })
  })
}

Rs232.prototype.dataHandler = function (cmd) {
  cmd = cmd.replace(/(\r\n|\n|\r)/gm, '')
  const msg = cmd.split(',')
  const item = msg[2]
  const param = msg[3]
  let match = null
  
  for (const route of this.routeStacks) {
    match = route.pathRegex.exec(cmd)
    if (match) {
      debug(match)
      const req = { 
        url: `/${item}`,
        param 
      }
      const res = _initRes(this, cmd)
      const next = _initNext(this, cmd)
      route.cb(req, res, next)
      break
    }
  }

  if (!match) {
    this.port.write(`API not exist${DELIMITER}`)
  }
}

Rs232.prototype.set = function (path, cb) {
  const pathArr = path.split(',')
  pathArr.splice(1,0,'set')

  this.routeStacks.push({
    pathRegex: pathRegexp(pathArr.join(',')),
    cb: cb
  })
}

Rs232.prototype.get = function (path, cb) {
  const pathArr = path.split(',')
  pathArr.splice(1,0,'get')

  this.routeStacks.push({
    pathRegex: pathRegexp(pathArr.join(',')),
    cb: cb
  })
}

function _initNext (Rs232, cmd) {
  return function (param) {
    if (param?.code !== undefined) {
      const str = `${cmd},fail:${param.code}${DELIMITER}`
      Rs232.port.write(str)
    }
  }
}

function _initRes (Rs232, cmd) {
  return {
    _status: 400,
    _cmd: cmd,
    _isReturnValue: true,
    status: function (statusCode = 400) {
      this._status = statusCode
      return this
    },
    json: function (msgObj) {
      const data = this._isReturnValue ? Object.values(msgObj)[0] : 'ok'
      const str = `${this._cmd},${data}${DELIMITER}`
      // 回傳執行結果給 rs232
      Rs232.port.write(str)
    }
  }
}

// METHODS.forEach(function (method) {
//   Rs232[method] = function (path, cb) {
//     Rs232.routeStacks.push({
//       pathRegex: pathRegexp(path),
//       cb: cb
//     })
//   }
// })

util.inherits(Rs232, EventEmitter)
exports = module.exports = new Rs232()
