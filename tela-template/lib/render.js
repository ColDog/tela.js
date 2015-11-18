/** The template handles all of the rendering and updates thrown
 * at it from the view.
 *
 * The main link between them is the oncomponent function and the prop function.
 * The former is called when a component is found on the initial render. This allows
 * you to set callbacks for when to update it. The latter is a function defined by
 * the view that returns the data needed given a string like 'user.name'. The template
 * should return 'Colin Walker'.
 *
 * Overall, the template takes a string and parses it into a dom structure. Then,
 * when you call render, it loops through and inserts the data it finds with the `prop`
 * function. Then, it caches this version in `this.rendered`. When an element is updated,
 * determined by the view, the view can just call template.update(id) to update this element
 * in the cached rendered template and the shadow DOM. When we navigate to a new route, the
 * view can call `render` everytime and immediately get the latest template.
 *
 * Performance wise, this limits very long renders.
 **/

'use strict'

class Template {
  constructor(tpl) {
    this.parse = require('./parser')
    this.template = tpl
    this.cache = {}
    this.dom = this.parse(tpl)
    this.components = {} // should be components[tagName] = render function
    this.rendered = null
  }

  /** prop provides the connection to the view. by returning the data requested
   *  by the template argument
   **/
  prop(arg) {}

  /** What to do when the component is being rendered. **/
  oncomponent(id, el, render) {}

  /** Formula for replacing {{ }} with bindings in a string
   * Just simply splits the string by {{ }}, and maps through,
   * passing the elements which had {{ }} around them to the
   * function provided and returning those that didn't.
   * */
  replaces(string, fn) {
    return string.split(/\{([^}}]+)?}}/g).map((arg) => {
      if (arg[0] === '{') {
        arg = arg.replace('{', '')
        return fn(arg.trim())
      } else {
        return arg
      }
    }).join('')
  }

  /** Formula for finding custom components delineated by tag and running
   * the specified function on them. Great for say defining a react component.
   * */
  customComponents() {
    for (var tag in this.components) {
      this.dom.search((el) => {el.tag === tag}).forEach((el) => {
        var render = () => { return this.components[tag](el) }

        var id = el.attrs.id || 'tl'+Math.random().toString(36).substr(2, 36)
        el.html = `<span id="${id}">${render()}</span>`
        this.cache[id] = render
        this.oncomponent(id, el)
      })
    }
  }

  /** Formula for each="user in users"
   * Maps through the text of the each elements and replaces it.
   * */
  each() {
    this.dom.search( (el) => { return el.attrs.each } ).forEach((el) => {
      var spl = el.attrs.each.split('in')
      if (!spl[1]) { console.warn('each iterations must be: user in users, no "in" found') ; return }
      var id = el.attrs.id || 'tl'+Math.random().toString(36).substr(2, 36)
      var root = spl[0].trim()
      delete el.attrs.each
      el.remove()
      var text = el.html
      var data = this.prop(spl[1].trim())


      el.parent.add(`<span id="${id}">${render()}</span>`, el.parent.children.indexOf(el) - 1)
      this.cache[id] = render
      this.oncomponent(id, el)
    })
  }

  /** Formula for replacing simple {{ }} bindings
   * Just walks through each element that has bindings and
   * replaces it using the replaces function.
   * */
  bindings() {
    this.dom.search( (el) => { return el.binding } ).map((el) => {
      var id = el.attrs.id || 'tl'+Math.random().toString(36).substr(2, 36)
      var text = el.value

      var render = () => {
        return this.replaces(text, (arg) => { return (() => { return this.prop(arg) })() })
      }

      el.parent.children[el.parent.children.indexOf(el)] = this.parse(`<span id="${id}">${render()}</span>`).children[0]
      this.cache[id] = render
      this.oncomponent(id, el)
    })
  }

  /** updating from the cache.
   * Just call this with the id you want to update. You
   * should store the ID in your callbacks and reactions.
   * This updates the cached rendered template on every call to update.
   * */
  update(id) {
    if (this.cache[id]) {
      var res = this.cache[id]()

      var el = this.dom.search((el) => {return el.attrs.id === id})[0]

      // set the element referenced by the id in the dom to be part of the dom.
      this.dom.search((el) => {return el.attrs.id === id})[0].html = res

      // re render the dom and cache
      this.rendered = this.dom.html

      // if the element exists in the document we also insert it there.
      if (typeof document !== 'undefined' && document.getElementById(id)) {
        document.getElementById(id).innerHTML = res
      }
    }
  }


  /** Rendering the template.
   * This provides the logic for rendering the template when ready.
   * NOTE, when render is called, it will not update the rendered template,
   * it expects the callbacks to call update for each referenced element.
   * */
  render() {
    // if we do not have a rendered template cached.
    if (!this.rendered) {
      this.customComponents()
      this.each()
      this.bindings()
      this.rendered = this.dom.html
    }

    // for the server, return the rendered template.
    return this.rendered
  }

}


let temp = `
  <p>
    Hello there everyone, this is a pretty cool thing <small>hello</small>{{ hello }}.
    <a href="hello">This is some cool stuff</a>
  </p>

`

var users = [
  {name: 'Colin'},
  {name: 'Colin'},
  {name: 'Colin'},
  {name: 'Colin'},
  {name: 'Colin'}
]
var greet = 'hello'

var t = new Template(temp)
t.prop = function(arg) {
  if (arg == 'users') {
    return users
  } else {
    return greet
  }
}

var c
t.oncomponent = function(id, el) { c = id }

console.log(t.render())
users[0].name = 'Colin the greatest'
greet = 'something else'

console.log( t.cache[c].toString() )

t.update(c)

