import Rs232Service from './bxb_rs232'
import TemplateCtrl from '../controllers/template.controller'
import APIError from '../middlewares/errors/APIError'

const debug = require('debug')('bxb:uart:rs232')
const endOfCmd = '\r\n'

// 儲存實際需要呼叫到的 controller function
const CmdSet = {
  templates: {
    current: {
      set: TemplateCtrl.exec
    }
  }
}

// 因為 controller 中會使用 res.status(...).json(...)
// 為了符合鏈式，status 必須回傳 res 物件本身
const res = {
  _status: 400,
  _cmd: '',
  _isReturnValue: true,
  status: function (statusCode = 400) {
    this._status = statusCode
    return this
  },
  json: function (msgObj) {
    const data = this._isReturnValue ? Object.values(msgObj)[0] : 'ok'
    const str = `${this._cmd},${data}${endOfCmd}`
    // 回傳執行結果給 rs232
    port.write(str)
  }
}

// controller 中會用到 next (不論是錯誤處理還是傳到下一層)
// 所以這邊也要模擬一個 next，不過應該只會做錯誤處理
const next = function (param) {
  if (param?.code !== undefined) {
    const str = `${res._cmd},fail:${param.code}${endOfCmd}`
    port.write(str)
  }
}

const port = Rs232Service.getPort()
const parser = Rs232Service.getParser()

// TODO: 以下判斷&監聽，之後會移動到 bxb_rs232
const os = require('os')
if (os.platform() !== 'darwin') {
  parser.on('data', data => {
    debug('Recv data: ', data.toString())

    const separated = data.toString().split(endOfCmd)
    separated.forEach(msg => {
      if (msg === '') return

      _processCmd(msg)
    })
  })
}

function _processCmd (cmd) {
  const msg = cmd.replace(/(\r\n|\n|\r)/gm, '').split(',')
  const route = msg[0]
  const method = msg[1]
  const ctrl = msg[2]
  const param = msg[3]
  const req = { }

  res._cmd = cmd.replace(/(\r\n|\n|\r)/gm, '')

  req.url = `/${ctrl}`
  debug(`${route}; ${method}; ${ctrl}; ${param}`)

  // check CmdSet
  if (CmdSet[route] === undefined) {
    next(new APIError({ message: 'RS232: route is not found', code: 'E00' }))
    return
  }

  if (CmdSet[route][ctrl] === undefined) {
    next(new APIError({ message: 'RS232: ctrl is not found', code: 'E00' }))
    return
  }

  if (CmdSet[route][ctrl][method] === undefined) {
    next(new APIError({ message: 'RS232: method is not found', code: 'E00' }))
    return
  }

  if (route === 'system' && method === 'get') {
    res._isReturnValue = true
  }

  if (route === 'system' && method === 'set') {
    req.body = { status: param }
    res._isReturnValue = false
  }

  if (route === 'templates' && method === 'set') {
    if (param === undefined) {
      next(new APIError({ message: 'RS232: param is undefined', code: 'E00' }))
      return
    }

    res._isReturnValue = true // exec 只會拿到 { data:'ok' }
    TemplateCtrl.load(req, res, next, param) // param(id) 錯的話，也會跑進 next 去
  }

  CmdSet[route][ctrl][method](req, res, next)
}
