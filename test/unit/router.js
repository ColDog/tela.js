'use strict'

const assert = require('assert')
const router = require('../../tela/lib/router')


before(function() {
  router.route('/',              'home')
  router.route('/users/:id',     'user-id')
  router.route('/users/new',     'new-user')
  router.route('/home/hello',    'home-hello')
  router.route('/hello',         'hello')
  router.route('/hello/:another/is/:userId/really/long/route', 'hello-there')
})


describe('router', () => {
  it('/', (done) => {
    assert.equal(router.match('/').view, 'home')
    done()
  })
  it('/users/123', (done) => {
    var match = router.match('/users/123')
    assert.equal(match.view, 'user-id')
    assert.equal(match.params.id, 123)
    done()
  })
  it('/nothing', (done) => {
    var match = router.match('/nothing')
    assert.equal(match.view, null)
    done()
  })
  it('/hello', (done) => {
    var match = router.match('/hello')
    assert.equal(match.view, 'hello')
    done()
  })
  it('/users/new', (done) => {
    var match = router.match('/users/new')
    assert.equal(match.view, 'new-user')
    done()
  })
  it('/hello/this/is/a/really/long/route', (done) => {
    var match = router.match('/hello/this/is/a/really/long/route')
    assert.equal(match.params.another,'this')
    assert.equal(match.params.userId,'a')
    assert.equal(match.view, 'hello-there')
    done()
  })
})
