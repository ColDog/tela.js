const Router = {
  _routes: {children: {}, view: null},
}

Router.route = function(path, view) {
  var current = Router._routes
  var spl = path.split('/')
  for (var i=0;i<spl.length;i++) {

    // create a node
    current.children[ spl[i] ]          = current.children[spl[i]] || {}
    current.children[ spl[i] ].children = current.children[spl[i]].children || {}
    current.children[ spl[i] ].view     = current.children[spl[i]].view || null

    // set current to equal the children of the next node
    current = current.children[spl[i]]

    // if the last iteration, set the view.
    if (i === spl.length-1) { current.view = view }
  }
  return Router
}

Router.match = function(path) {
  var spl = path.split('/')
  var current = Router._routes
  var params = {}
  for (var i=0;i<spl.length;i++) {

    // checks the current routes children for matches
    if (current.children[spl[i]]) {
      // if it matches directly, set it and break
      current = current.children[ spl[i] ]

    } else {

      // if it doesn't match directly, look for wildcard routes
      // and named parameters
      for (var key in current.children) {

        // return the view of the wildcard route
        if (key === '*') {
          return current.children['*'].view
        }

        // look for named parameters and add to parameter list.
        var param = key.split(':')[1]
        if (param) {
          params[param] = spl[i]
          current = current.children[key]
          break
        }

      }

    }

    // if we are on the last iteration, find the view of the current
    // route and return this along with the parameters. If it doesn't exist,
    // give up and return the default view set on the router.
    if (i === spl.length - 1) {
      if (!current.view) { return {view: Router.view, params: null} }
      return {
        view: current.view,
        params: params
      }
    }
  }
  return {view: Router.view, params: null}
}

Router.routes = function(obj) {
  for (var path in obj) { Router.route(path, obj[path]) }
  return Router
}

module.exports = Router
