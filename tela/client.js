'use strict'

const ENV = {
  server: false,
  client: true,
}

window.socket = require('socket.io-client')('http://localhost:3000')
window.state  = {}
window.currentPath = null
window.ENV = ENV

const app = {}
app.clients = {}
app.models  = {}
app.pages = {}

app.db = {}
app.db.Model  = require('./lib/resource')
app.View      = require('./lib/view')
app.Stream    = require('./lib/stream').Stream
app.request   = require('./lib/stream').request
app.router    = require('./lib/router')

app.router.to = (path, evt, ctx) => {
  path = path.replace(/[^\/]*\/\/[^\/]*/g, '') // remove stuff before the pathname

  if (!state[path]) {
    var matched = app.router.match(path).view // match a path
    if (matched) {
      ctx = ctx || {}
      ctx.params = matched.params

      // instantiate a new version of the view on the state with the current path.
      state[path] = new matched(ctx)

      state[path].on('ready', function(){
        if (serverCache && serverCache.path === path) {
          state[path].cache = serverCache.cache
          state[path].template = document.getElementById('main').innerHTML
        }
        state[path].connect()
        state[path].render()
      })
    } else {
      // todo display error page
      // app.router.to('/')
    }
  } else {
    state[path].render()
  }

  history.pushState(ctx, '', path)
}

app.config = function(config) { }

app.start = function() {
  app.router.to(document.location.pathname)

  window.addEventListener("popstate", function(evt) {
    var path = document.location
    var state = evt.state
    app.router.to(path, evt)
  })

  document.onclick = function(evt) {
    if (evt.target.tagName === 'A') {
      evt.preventDefault()
      app.router.to(evt.target.href, evt)
    }
  }
}

window.router = app.router
window.app = app
module.exports = app
