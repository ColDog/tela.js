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

app.router.to = (path, matched, ctx) => {
  path = path.replace(/[^\/]*\/\/[^\/]*\//g, '') // remove stuff before the pathname
  window.currentPath = path // set the current path
  history.pushState({}, '', path)

  if (!state[path]) {
    matched = matched || app.router.match(path).view // match a path
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
      window.location = path
    }
  } else {
    state[path].render()
  }

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
      var match = app.router.match(evt.target.href).view
      if (match) {
        evt.preventDefault()
        app.router.to(evt.target.href, match)
      }
    }
  }
}

window.router = app.router
window.app = app
module.exports = app
