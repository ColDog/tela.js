'use strict'

module.exports = function(db) {
  const query = require('./query')(db)
  const Validator = require('./validation')
  const runAsync = require('../../utils').allPromises

  class Model {
    constructor(attrs) {
      this._attrs = {}
      this._errors = []
      this.updateAttrs(attrs)
    }

    get _query() {
      return query(this, this.constructor.name).query
    }

    static get _query() {
      return query(this, this.name).query
    }

    get id() {
      return this._attrs.id
    }

    set id(val) {
      this._attrs.id = val
    }

    updateAttrs(attrs) {
      for (var attr in attrs) {
        ((attr) => {
          this._attrs[attr] = attrs[attr];

          Object.defineProperty(this, attr, {
            set: (val) =>  { return this._attrs[attr] = val },
            get: ()    =>  { return this._attrs[attr] },
            configurable: true
          })

        })(attr)
      }
    }

    beforeCreate() {}
    beforeDestroy() {}
    beforeValidation() {}
    before() {}
    after() {}
    afterUpdate() {}
    afterCreate() {}
    afterDestroy() {}
    beforeUpdate() {}
    beforeSave() {}

    validates(v) {}

    valid() {
      return this._errors[0] === undefined
    }

    __update() {
      this._attrs.updated_at = Date.now()
      return this._query(
        { event: 'change', type: 'update' },
        (table) => { return table.where('id', this.id).returning('id').update(this._attrs) },
        (data)  => { return this }
      )
    }

    __insert() {
      if (this.valid()) {
        this._attrs.updated_at = Date.now()
        this._attrs.created_at = Date.now()
        return this._query(
          { event: 'change', type: 'create' },
          (table) => { return table.returning('id').insert(this._attrs) },
          (data)  => { this.id = data[0] ; return this }
        )
      } else {
        return new Promise((resolve, reject) => { reject(this) })
      }
    }

    __destroy() {
      return this._query(
        { event: 'change', type: 'destroy' },
        (table) => { return table.where('id', this.id).del() },
        (data)  => { return data }
      )
    }

    save() {
      this._errors = [] // start fresh with the errors just in case
      var type = this._attrs.id ? 'update' : 'create'
      var validator = new Validator(this)
      this.validates(validator)

      var list
      if (type === 'create') {
        list = [
          this.before(),
          this.beforeSave(),
          this.beforeCreate(),
          validator.run(),
          this.__insert(),
          this.afterCreate(),
          this.after()
        ]
      } else if (type === 'update') {
        list = [
          this.before(),
          this.beforeSave(),
          this.beforeUpdate(),
          validator.run(),
          this.__update(),
          this.afterUpdate(),
          this.after()
        ]
      }

      return new Promise((resolve, reject) => {
        runAsync(list)
          .then(
            (res) => { resolve(this) },
            (err) => { reject(this)  }
          )
      })
    }

    destroy() {
      return new Promise((resolve, reject) => {
        runAsync([
          this.before(),
          this.beforeDestroy(),
          this.__destroy(),
          this.afterDestroy(),
          this.after()
        ]).then(
          (res) => { resolve(this) },
          (err) => { reject(this) }
        )
      })
    }

    update(attrs) {
      this.updateAttrs(attrs)
      return this.save()
    }

    model() {
      return this.constructor
    }

    belongsTo(model) {
      var param = this._attrs[model._tableName + '_id']
      return model.where({id: param})
    }

    hasMany(model) {
      var param = this._tableName + '_id'
      return model.where(param, this.id)
    }

    static create(params) {
      console.log('create params', params)
      return new this(params).save()
    }

    static update(params) {
      if (!params.id) { return false } // returns false if we aren't given an ID.
      return new this(params).save()
    }

    // querying parameters
    static where(params, id) {
      var q = {}
      if (params && id) { q[params] = id }
      else { q = params }

      return this._query(
        { event: 'query', type: 'where' },
        (table) => { return table.where(q) },
        (data)  => { return data.map((rec) => { return new this(rec) }) }
      )
    }

    static findBy(attr, param) {
      return this._query(
        { event: 'query', type: 'find' },
        (table) => { return table.where(attr, param).limit(1) },
        (data)  => { return data[0] ? new this(data[0]) : null }
      )
    }

    static all() {
      return this.where({})
    }

    static find(id) {
      return this.findBy('id', id)
    }

  }

  return Model
}
