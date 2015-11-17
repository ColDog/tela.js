exports.up = function(knex, Promise) {
  knex.schema.createTable('comments', function (table) {
    table.increment('id').primary()
    table.string('name')
    table.string('content')
    table.timestamps()
  })
}
exports.down = function(knex, Promise) {
  knex.schema.dropTable('comments')
}
