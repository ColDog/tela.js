'use strict'

const tests = require('./helper')
const assert = require('assert')

var simp
describe('reading', function(){
  it('can find a record', function(done){
    tests.Simple.find(1)
      .then((rec) => { assert(rec.id, 1) ; done() })
  })

  it('can find a non-existent record', function(done){
    tests.Simple.find(200000)
      .then((rec) => {
        assert.equal(rec, null)
        done()
      })
  })

  it('can find all records', function(done){
    tests.Simple.all()
      .then((rec) => {
        assert(rec.length > 1)
        done()
      })
  })

  it('can find some records', function(done){
    tests.Simple.where({name: 'hello'})
      .then((recs) => {
        recs.forEach((rec) => { assert.equal(rec.name, 'hello') })
        done()
      })
  })

  it('can find by something', function(done){
    tests.Simple.findBy('name', 'hello')
      .then((rec) => {
        assert.equal(rec.name, 'hello')
        done()
      })
  })



})