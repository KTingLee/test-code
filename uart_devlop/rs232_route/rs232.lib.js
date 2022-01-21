import { EventEmitter } from 'events'
import SerialPort from 'serialport'
import util from 'util'
import os from 'os'
import Readline from '@serialport/parser-readline'

const debug = require('debug')('bxb:rs232')
const SerialPortPath = os.platform() === 'linux' ? '/dev/ttyS1' : '/dev/tty.usbserial-14410'

// RS232 物件負責建立 rs232 io 物件，並製作 parse 處理收到的訊號
const Rs232 = function () {
  this.port = null
  this.parser = null

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
}

Rs232.prototype.getPort = function () {
  return this.port
}

Rs232.prototype.getParser = function () {
  return this.parser
}

util.inherits(Rs232, EventEmitter)
module.exports = new Rs232()
