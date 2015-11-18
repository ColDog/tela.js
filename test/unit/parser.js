'use strict'
const Dom = require('../../tela/lib/parser')
const assert = require('assert')

let temp = `
  <h1>Hello World</h1>
  <h2>Hello again</h2>
  <p>
    Hello there everyone, this is a pretty cool thing <small>hello</small>{{ hello }}.
    <a href="hello">This is some cool stuff</a>
  </p>
  <ul>
    <li each="users"></li>
  </ul>

`

var dom = new Dom(temp)

describe('DOM', function(){
  it('selects those elements with bindings', function(done){
    dom.search('{{ }}').map((el) => { assert(el.binding) })
    done()
  })
  it('selects those elements by name', function(done){
    dom.search('p').map((el) => { assert(el.tag === 'p') })
    done()
  })
  it('selects those elements by attribute', function(done){
    dom.search('[href="hello"]').map((el) => { assert(el.attrs.href === 'hello') })
    done()
  })
  it('selects those elements by attribute', function(done){
    dom.search('[each="users"]').map((el) => { assert(el.attrs.each === 'users') })
    done()
  })
  it('can set the html of an element', function(done){
    dom.search('[each="users"]')[0].html('<p>This is the new inner html</p>')
    assert( dom.search('[each="users"]')[0].children[0].tag == 'p' )
    done()
  })
})