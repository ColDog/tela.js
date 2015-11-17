'use strict'

module.exports = function(app) {
  // register your models here. models must be registered on app.db.models or
  // else the requests sent will not be able to find the model.
  app.models.Comment = require('./Comment')

  // remember, you don't register post or delete routes, these are only get routes
  // which will be activated on either the server or the client to serve the view.
  // requests are automatically routed to database actions without the need for controllers.

  // Routes must be mapped to a View class. When a route is activated, the class will
  // be initialized with the route parameters as its argument and then render() will be called.
  // this is the same for a route change, except the data will be already cached so rendering
  // should be much faster.
  app.router.routes({
    'comments':     require('./views/index'),
    'home':     require('./views/index')
  })
}
