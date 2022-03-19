module.exports = {
  HOST: 'http://localhost:8090/api',
  userCredentials: {
    username: 'admin',
    password: '5555'
  }, 
  errorUser: {
    username: 'errorUsername',
    password: '1234'
  },
  errorPassword: {
    username: 'admin',
    password: '56789'
  },
  addUser: {
    username: 'test01',
    fullname: 'test01-fullname',
    password: '1234',
    email: 'test01@email',
    role: 'user'
  },
  addRole: {
    title: 'newRole',
    permission: {
      broadcast: false
    }
  }
}