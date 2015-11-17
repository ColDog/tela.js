'use strict'

const Stream    = require('./stream').Stream
const request   = require('./stream').request
const pluralize = require('pluralize')

class Model {
  constructor() {
  }

  static all() {
    return new Stream(this.name, {}, pluralize(this.name))
  }

  static find(id) {
    return new Stream(this.name, {id: id}, pluralize(this.name))
  }

  static where(qry) {
    return new Stream(this.name, qry, pluralize(this.name))
  }

  static create(params) {
    return request(this.name, 'create', params)
  }

  static update(params) {
    return request(this.name, 'update', params)
  }

  update(params) {
    return request(this.name, 'update', params)
  }

  static destroy(id) {
    return request(this.name, 'destroy', {id: id})
  }

  destroy(id) {
    return request(this.name, 'destroy', {id: id})
  }

}

module.exports = Model
