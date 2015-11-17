'use strict'

const tools = require('../../utils')

class Validator {
  constructor(rec, cb) {
    this.rec = rec
    this.checks = []
  }

  run() {
    return new Promise((resolve, reject) => {

      this.checks.push(() => {
        resolve()
      })

      tools.run(this, this.checks)
    })
  }

  addValidation(block) {
    this.checks.push(block)
  }

  error(attr, msg, code) {
    this.rec._errors.push({
      attr: attr,
      msg: msg,
      code: code
    })
  }

  presence(attr) {
    this.checks.push((next) => {
      if (!this.rec[attr]) { this.error(attr, 'must be present.') }
      next()
    })
  }

  uniqueness(attr) {
    this.checks.push((next) => {
      this.rec.model.where(attr, this.rec[attr]).then(
        (res) => {
          if (res) { this.error(attr, 'is not unique.') }
          next()
        }
      )
    })
  }

}

module.exports = Validator
