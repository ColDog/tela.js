'use strict'

module.exports = function(db) {
  const pluralize = require('pluralize')

  function query(model, modelName) {
    var tableName = pluralize(modelName.toLowerCase())
    var table = db(tableName)

    function caller(opts, block, cb) {
      return new Promise((resolve, reject) => {
        opts.start = Date.now()
        block( table )
          .then(
            (data) => {
              data = cb(data)
              opts.time = new Date - opts.start
              opts.data = data
              db.emit(opts.event, opts.type, opts)
              resolve(data)
            },
            (err) => {
              opts.time = new Date - opts.start
              opts.errors = err
              console.log('errored', err)
              db.emit('errored', opts.stack = err.stack)
              model._errors.push(err)
              reject(model)
            }
        )
      })
    }

    return {
      table: table,
      query: caller,
      tableName: tableName
    }
  }

  return query
}