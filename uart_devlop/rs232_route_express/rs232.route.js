import Rs232Service from '../lib/bxb_rs232'
import TemplateCtrl from '../controllers/template.controller'
import SystemCtrl from '../controllers/system.controller'

Rs232Service.get('system,schedule', (req, res, next) => {
  SystemCtrl.configGet(req, res, next)
})

Rs232Service.set('templates,current,:id', (req, res, next) => {
  const id = req.param
  TemplateCtrl.load(req, res, next, id)
  TemplateCtrl.exec(req, res, next)
})

Rs232Service.set('system,schedule,:param', (req, res, next) => {
  req.body = { status: req.param }
  SystemCtrl.configSet(req, res, next)
})