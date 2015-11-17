const pluralize = require('pluralize')
const fs = require('fs')
const path = require('path')

var name = process.argv[2]
var plural = pluralize(name.toLowerCase())
var fields = []
process.argv.slice(3, process.argv.length).forEach(function(arg){
  var spl = arg.split(':')
  fields.push({ name: spl[0], type: spl[1] })
})

var parsed = []
fields.forEach(function(field){
  if (field.type === 'references') {
    parsed.push(`        t.integer('${field.name}_id').references('id').inTable('${plural}').onDelete('set null')`)
  } else {
    parsed.push(`        t.${field.type}('${field.name}')`)
  }
})

var migration = `'use strict'

module.exports = function(db){
exports.up = function(knex, Promise) {
  knex.schema.createTable('${plural}', function (table) {
    table.increment('id').primary()
${parsed.join('\n')}
    table.timestamps()
  })
}
exports.down = function(knex, Promise) {
  knex.schema.dropTable('${plural}')
}
`



var showTemp = `<h1>Welcome to the ${name} view</h1>`

var indexTemp = `<h1>Welcome to the ${plural} view</h1>
<ul>
  <li each="item" stream="${plural}">{{item}}</li>
</ul>
`

var showView = `'use strict'
const View = require('live').View
const ${name} = require('../${name}')

// This is the View, or ViewModel if you want to call it that. This is
// where you fetch your data and specify the template that will be rendered.
// the render function does different things on the server and the client.
// simply attach your data in the constructor and use it in the matching
// template.

class ${name}Show extends View {
  constructor(ctx){
    super(ctx)
    this.template = require('./show.html')
    this.${name.toLowerCase()} = ${name}.find(this.params.id)
  }

  get events() {
    return {
      'submit.edit': function(data) {
        ${name}.create(data)
      }
    }
  }
}
`
var indexView = `'use strict'

const View = require('live').View
const ${name} = require('../${name}')

// This is the View, or ViewModel if you want to call it that. This is
// where you fetch your data and specify the template that will be rendered.
// the render function does different things on the server and the client.
// simply attach your data in the constructor and use it in the matching
// template.

class ${name}Index extends View {
  constructor(ctx){
    super(ctx)
    this.template = require('./index.html')
    this.${plural} = ${name}.all()
  }

  get events() {
    return {
      'submit.new': function(data) {
        ${name}.create(data)
      }
    }
  }
}
`

var references = []
fields.forEach(function(field){
  if (field.type === 'references') {
    references.push(
`
  ${field.name}() {
    this.belongsTo(${field.name})
  }
`
    )
  }
})
var model = `'use strict'
const Model = require('live').Model

// This is the Model that you can use to access your data. On the client
// the model refers to streams and requests. ie. when you say User.all()
// it returns a stream with all users that updates on new data. The view
// should recognize the stream and automatically update the relevant data.
// When you call User.create({name: ... }) it sends a request to the database
// asking for the 'create' action to be called on User with the specified
// parameters.

class ${name} extends Model {
  constructor(attrs) {
    super(attrs)
  }
${references.join('\n')}
}
`
var index = `'use strict'

module.exports = function(app) {
  // register your models here. models must be registered on app.db.models or
  // else the requests sent will not be able to find the model.
  app.db.models.${name} = require('./${name}')

  // remember, you don't register post or delete routes, these are only get routes
  // which will be activated on either the server or the client to serve the view.
  // requests are automatically routed to database actions without the need for controllers.

  // Routes must be mapped to a View class. When a route is activated, the class will
  // be initialized with the route parameters as its argument and then render() will be called.
  // this is the same for a route change, except the data will be already cached so rendering
  // should be much faster.
  app.routes({
    '/${plural}':     require('./views/index'),
    '/${plural}/:id': require('./views/show')
  })
}
`

// create new base directory ie. users
try { fs.mkdirSync(path.resolve(__dirname, '../', 'app', plural)) }
catch(e) { if ( e.code != 'EEXIST' ) throw e; }

// create new base directory ie. users/views
try { fs.mkdirSync(path.resolve(__dirname, '../', 'app', plural, 'views')) }
catch(e) { if ( e.code != 'EEXIST' ) throw e; }

// create new base directory ie. users/components
try { fs.mkdirSync(path.resolve(__dirname, '../', 'app', plural, 'components')) }
catch(e) { if ( e.code != 'EEXIST' ) throw e; }

// create a new test directory ie. test/users
try { fs.mkdirSync(path.resolve(__dirname, '../', 'test', plural)) }
catch(e) { if ( e.code != 'EEXIST' ) throw e; }

// create a new test directory for models ie. test/users/models
try { fs.mkdirSync(path.resolve(__dirname, '../', 'test', plural, 'models')) }
catch(e) { if ( e.code != 'EEXIST' ) throw e; }

// create a new test directory for models ie. test/users/views
try { fs.mkdirSync(path.resolve(__dirname, '../', 'test', plural, 'views')) }
catch(e) { if ( e.code != 'EEXIST' ) throw e; }

// write to all of the files with the above templates
fs.writeFile(path.resolve(__dirname, '../', 'app', plural, `${name}.js`), model)
fs.writeFile(path.resolve(__dirname, '../', 'app', plural, `index.js`), index)
fs.writeFile(path.resolve(__dirname, '../', 'app', plural, 'views', `index.js`), indexView)
fs.writeFile(path.resolve(__dirname, '../', 'app', plural, 'views', `show.js`), showView)
fs.writeFile(path.resolve(__dirname, '../', 'app', plural, 'views', `index.html`), indexTemp)
fs.writeFile(path.resolve(__dirname, '../', 'app', plural, 'views', `show.html`), showTemp)
fs.writeFile(path.resolve(__dirname, '../', 'migrations', `${Date.now()}-${name}.js`), migration)

console.log(name, 'resource generated. Make sure to add the following to app/main:\n\n', `  require('./${plural}')(app)`, '\n\n')
