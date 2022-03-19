
describe('Test script', () => {
  describe('API test:', () => {
    describe('User:', () => require('./api.test/user.test'))
    describe('Role:', () => require('./api.test/role.test'))
  })
  
  describe('Model test:', () => {
    describe('Log.model:', () => require('./model.test/log.model.test'))
  })
  

})
