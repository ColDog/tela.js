'use strict'

var path = require('path')
const fs = require('fs')

var ENV = {
  server: true,
  client: false,
  get root() { return path.dirname(require.main.filename) }
}

global.ENV = ENV

const app = {}
app.clients = {}
app.models  = {}
app.pages   = {}
app.View    = require('./lib/view')
app.Stream  = require('./lib/stream').Stream
app.request = require('./lib/stream').request
app.router  = require('./lib/router')
app.middleware = []

app.config = function(config) {
  app.db = require('./db')(config.db)
  app.pages.index     = fs.readFileSync(config.files.index, 'utf8')
  app.pages.assets    = fs.readFileSync(config.files.js, 'utf8')
  app.pages.error     = fs.readFileSync(config.files.error, 'utf8')
  app.pages.js_path   = config.files.js
  app.middleware = config.middleware || []
}

app.start = function() {
  require('./lib/server')(app)
  require('./lib/sockets')(app)

  app.server.listen(3000, function(){
    console.log("Server listening on: http://localhost:3000")
  });
};

require.extensions['.html'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8')
}


module.exports = app
