'use strict'

module.exports = function(config) {
  var db = require('knex')(config)
  db.Model = require('./lib/model')(db)
  return db
}
