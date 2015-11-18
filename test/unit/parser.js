'use strict'
const Dom = require('../../tela/lib/parser')

let temp = `
  <h1>Hello World</h1>
  <h2>Hello again</h2>
  <p>
    Hello there everyone, this is a pretty cool thing <small>hello</small>{{ hello }}.
    <a href="hello">This is some cool stuff</a>
  </p>
`

var dom = new Dom(temp)

describe('DOM', function(){
  it('selects those elements with bindings', function(done))

})