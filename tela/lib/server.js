'use strict'

const url     = require('url')
const fs      = require('fs')
const Router  = require('./router')
const http    = require('http')

module.exports = function(app) {

  function buildBody(stuff) {
    return app.pages.index.replace(/(<main[^>]*>)[^<]*(<\/main>)/g, function(a,b,c){ return b + stuff + c  })
  }

  function handleRequest(req, res){
    var start = Date.now()
    var ctx = {
      path: url.parse(req.url).pathname,

      done: false,

      // sends a redirect with a flash message header
      redirect: function(path, message) {
        res.writeHead(302, { 'Location': path,  'X-Message': message })
        res.end('redirected')
        this.done = true
      },

      // sends the html error page
      error: function(code) {
        res.writeHead(code)
        res.end('sorry')
      }
    }

    if (ctx.path === '/app.js') {
      // the default path for the compiled assets
      res.writeHead(200, {'Content-Type': 'application/javascript'})
      res.end(app.pages.assets)

    } else {
      // render the index.html file with the corresponding route,
      var body = ''
      req.on('data', function (data) { body += data; })
      req.on('end',function(){
        req.body = body

        // match routes.
        ctx.route = app.router.match(ctx.path)

        // if we cannot find a route send a nice message.
        if (!ctx.route.view) {
          ctx.error(404)
          return
        }

        // run the before action callbacks
        ctx.route.view.before.apply(ctx)

        if (!ctx.done) {
          // render the view
          var view = new ctx.route.view(ctx)
          view.on('ready', (view) => {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(buildBody( view.render() ))
            console.log('finished', new Date() - start, 'ms')
          })
        }

      })
    }

  }

  app.server = http.createServer(handleRequest)
}