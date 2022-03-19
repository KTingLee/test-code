import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import Config from '../config.test'

chai.use(chaiHttp)
chai.should()

const agent = chai.request.agent(`${Config.HOST}`)

before(async () => {
  await agent.post('/auth/login').send(Config.userCredentials)
})

after(async () => {
  await agent.post('/auth/logout')
})

describe('# POST /roles', () => {
  it('should success to add a role', async () => {
    let role = Object.assign({}, Config.addRole)

    let res = await agent.post('/roles').send(role)
    expect(res).to.have.status(200)
    expect(res.body.changes).to.be.equal(1)
    expect(res.body.lastInsertRowid).to.be.a('number')

    //after
    const roleId = res.body.lastInsertRowid
    res = await agent.delete(`/roles/${roleId}`)
  })

  it('should fail to add a role because it already exist', async () => {
    let res = await agent.post('/roles').send({
      title: 'admin',
      permission: {}
    })
    expect(res).to.have.status(400)
    expect(res.body.message).to.be.equal('role already exist')
  })
})

describe('# GET /roles', () => {
  it('should success to list all roles', async () => {
    const res = await agent.get('/roles')
    expect(res).to.have.status(200)
    expect(res.body).to.be.an('array')
    for (const role of res.body) {
      expect(role).to.have.keys('id', 'title', 'permission')
      expect(role.id).to.be.a('number')
      expect(role.title).to.be.a('string')
      expect(role.permission).to.be.an('object')
    }
  })
})

describe('# GET /roles/:id', () => {
  it('should success to get a role', async () => {
    const res = await agent.get('/roles/1')
    expect(res).to.have.status(200)
    expect(res.body).to.be.an('object')
    expect(res.body).to.have.keys('id', 'title', 'permission')
    expect(res.body.id).to.be.a('number')
    expect(res.body.title).to.be.a('string')
    expect(res.body.permission).to.be.an('object')
  })

  it('should fail to get a role due to non-exist role id', async () => {
    const res = await agent.get('/roles/0')
    expect(res).to.have.status(404)
    expect(res.body.message).to.be.equal('role id not exist')
  })

  it('should fail to get a role due to error type role id', async () => {
    const res = await agent.get('/roles/errorType')
    expect(res).to.have.status(400)
    expect(res.body.message).to.be.equal('role id error')
  })
})

describe('# PUT /roles/:id', () => {
  it('should success to modify a role name', async () => {
    let role = Object.assign({}, Config.addRole)
    let res = await agent.post('/roles').send(role)
    const roleId = res.body.lastInsertRowid

    role.title = 'modify-Role'
    res = await agent.put(`/roles/${roleId}`).send(role)

    expect(res).to.have.status(200)
    expect(res.body.changes).to.be.equal(1)

    // after
    await agent.delete(`/roles/${roleId}`)
  })

  it('should success to modify a role permission', async () => {
    let role = Object.assign({}, Config.addRole)
    let res = await agent.post('/roles').send(role)
    const roleId = res.body.lastInsertRowid

    role.permission = {broadcast: true}
    res = await agent.put(`/roles/${roleId}`).send(role)

    expect(res).to.have.status(200)
    expect(res.body.changes).to.be.equal(1)

    // after
    await agent.delete(`/roles/${roleId}`)
  })

  it('should fail to modify a admin permission', async () => {
    let res = await agent.get('/roles')
    let admin = res.body.find(e => e.title === 'admin')

    res = await agent.put(`/roles/${admin.id}`).send({
      title: 'admin',
      permission: {broadcast: true}
    })

    expect(res).to.have.status(400)
    expect(res.body.message).to.be.equal(`can not modify admin permission`)
  })
})

describe('# DEL /roles/:id', () => {
  it('should success to delete a role', async () => {
    let res = await agent.post('/roles').send(Config.addRole)
    const roleId = res.body.lastInsertRowid

    res = await agent.delete(`/roles/${roleId}`)
    expect(res).to.have.status(200)
    expect(res.body.data).to.be.equal('ok')
  })

  it('should fail to delete admin', async () => {
    let res = await agent.get('/roles')
    const admin = res.body.find(e => e.title === 'admin')

    res = await agent.delete(`/roles/${admin.id}`)
    expect(res).to.have.status(400)
    expect(res.body.message).to.be.equal('can not delete admin or user')
  })

  it('should fail to delete user', async () => {
    let res = await agent.get('/roles')
    const user = res.body.find(e => e.title === 'user')

    res = await agent.delete(`/roles/${user.id}`)
    expect(res).to.have.status(400)
    expect(res.body.message).to.be.equal('can not delete admin or user')
  })

  it('should fail to delete a role which is used by user', async () => {
    const roleTitle = 'testRole'
    let before = await agent.post('/roles').send({
      title: roleTitle,
      permission: {}
    })
    const roleId = before.body.lastInsertRowid

    before = await agent.post('/users').send({
      username: 'test02',
      fullname: 'test02-fullname',
      password: '1234',
      email: 'test02@email',
      role: roleTitle
    })
    const userId = before.body.lastInsertRowid

    const res = await agent.delete(`/roles/${roleId}`)
    expect(res).to.have.status(400)
    expect(res.body.message).to.be.equal('this role is used by user')

    // after
    await agent.delete(`/users/${userId}`)
    await agent.delete(`/roles/${roleId}`)
  })
})