'use strict'

var db = require('../index')({
  client: 'sqlite3',
  connection: {
    filename: "./test.sqlite"
  }
})

function log(event, data) {
  console.log(event, data)
}

//db.client.on('query', function(query){
//  log('QUERY', query)
//});
//
//['create', 'update', 'destroy', 'where', 'find'].forEach(function(name){
//  db.on(name, function(info){ log(name, info) })
//})



db.schema.hasTable('users').then(function(exists) {
  if (!exists) {
    return db.schema.createTable('users', function(t) {
      t.increments()
      t.string('name').notNullable()
      t.string('email')
      t.timestamps()
    })
  }
})

db.schema.hasTable('books').then(function(exists) {
  if (!exists) {
    return db.schema.createTable('books', function(t) {
      t.increments()
      t.string('name')
      t.integer('user_id').references('id').inTable('users').onDelete('set null')
      t.timestamps()
    })
  }
})

db.schema.hasTable('simples').then(function(exists) {
  if (!exists) {
    return db.schema.createTable('simples', function(t) {
      t.increments()
      t.string('name')
      t.timestamps()
    })
  }
})


class User extends db.Model {
  constructor(attrs) {
    super(attrs)
  }

  fields(t) {

    t.string('name')
    t.timestamps()
  }

  validates(v) {
    v.presence('name')
  }

  books() {
    return this.hasMany(Book)
  }

}

class Book extends db.Model {
  constructor(attrs) {
    super(attrs)
  }

  user() {
    return this.belongsTo(User)
  }

}

class Simple extends db.Model {
  constructor(attrs) {
    super(attrs)
  }
}

module.exports.Simple = Simple
module.exports.Book = Book
module.exports.User = User