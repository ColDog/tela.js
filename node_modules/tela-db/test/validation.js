'use strict'

const tests = require('./helper')
const assert = require('assert')

var user
describe('Validations', function() {
  it('can validate', function (done) {
    user = new tests.User({name: null})
    user.save().then(
      (rec) => { assert(false) ; done() },
      (rec) => {
        assert.equal(user._errors[0].attr, 'name')
        done()
      }
    )
  })
})