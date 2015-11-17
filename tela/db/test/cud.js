'use strict'

const tests = require('./helper')
const assert = require('assert')

describe('CUD Functions', function(){
  it('can create', function(done){
    tests.Simple.create({name: 'hello'}).then(
      (rec) => {
        assert.notEqual(rec.id, undefined)
        assert.equal(rec.name, 'hello')
        done()
      }
    )
  })

  it('can update', function(done) {
    var id
    tests.Simple.create({name: 'hello'})
      .then((rec) => {
        id = rec.id
        return rec.update({name: 'updated'})
      })
      .then((rec) => {
        assert.equal(id, rec.id)
        assert.equal(rec.name, 'updated')
        done()
      })
  })

  it('can destroy', function(done) {
    var id
    tests.Simple.create({name: 'hello'})
      .then((rec) => {
        id = rec.id
        return rec.destroy()
      })
      .then((des) => {
        assert.notEqual(des, undefined)
        return tests.Simple.find(id)
      })
      .then((rec) => {
        assert.equal(rec, null)
        done()
      })
  })

})