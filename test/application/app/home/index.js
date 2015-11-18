'use strict'

module.exports = function(app) {
  app.router.routes({
    '/': require('./views/index')
  })
}