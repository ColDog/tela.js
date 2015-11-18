'use strict'

function parse(tpl, dom) {
  dom = dom || {tag: 'div', children: []}
  var rehtml = /<([^>]*)>/g
  var stack = [dom]

  function text(start) {
    var val = tpl.substring(start).match(/[^<]*/)[0].trim()
    if (val) {
      return {
        type: 'text',
        value: val,
        attrs: {},
        binding: val.match(/\{\{.*}}/) ? true : false,
        children: []
      }
    }
  }

  var match;
  while(match = rehtml.exec(tpl)) {

    var current = stack[0] // returns current element as last in list

    // Found an opening tag
    if (match[1].indexOf('/') < 0) {
      var tag = match[1].trim().split(' ')[0];

      // parse the attributes. Loop through matches of the attributes and add them to a
      // hash to be added to the element.
      var attrs = {};
      var reargs = /([^=]*)="([^"]*)"/g;
      var attrMatch;
      while(attrMatch = reargs.exec(match[1].substring(tag.length, match[1].length))) {
        attrs[attrMatch[1].trim()] = attrMatch[2].trim()
      }

      // add to the stack the relevant information. Gives us an ID tag to use
      // later to attach the element to the dom, as well as relevant indices.
      stack.unshift({
        id: attrs && attrs.id ? attrs.id : tag+'-'+Math.random().toString(36).substr(2, 36),
        tag: tag,
        type: 'element',
        attrs: attrs,
        html: function(val) {
          this.children = parse(val).children
        },
        addHtml: function(val) {
          this.children = this.children.concat( parse(val) )
        },
        addText: function(val) {
          this.children.push({
            attrs: {},
            type: 'text',
            value: val,
            binding: val.match(/\{\{.*}}/) ? true : false,
            children: []
          })
        },
        children: []
      })

      var followingText = text(match.index + match[0].length)
      if (followingText) { stack[0].children.push(followingText) }
      // Found a closing tag.
    } else {
      var trimmed = match[1].trim().replace('/', '');

      for (var i=0;i<stack.length;i++) {
        var element = stack[i];
        if (element.tag === trimmed) {
          stack.splice(i, 1)  // remove from stack
          current = stack[0]  // reset current element important! or could refer to self

          // push this element onto the current elements children
          current.children.push(element)

          // push the text following this tag and in between the next into the children.
          var moreText = text( match.index + match[0].length )
          if (moreText) { current.children.push(moreText) }
          break
        }
      }

    }
  }

  return dom
}


class Dom {
  constructor(tpl) {
    this.template = tpl
    this.dom = parse(this.template)
  }

  search(arg) {
    var results = []

    var condition
    if (arg == '{{ }}') {
      condition = (el) => { return el.binding }
    } else if (arg[0] == '#') {
      condition = (el) => { return el.attr.id == arg.splice(1) }
    } else if (arg[0] == '.') {
      condition = (el) => { return el.attr.class == arg.splice(1) }
    } else if (arg[0] == '[') {
      var spl = arg.replace(/[\[\]]/g, '').split('=')
      var val = spl[1].replace(/"/g, '').trim()
      var attr = spl[0].trim()
      condition = (el) => {
        if (!el.attrs) { return false }
        return el.attrs[attr] === val
      }
    } else {
      condition = (el) => { return el.tag == arg }
    }

    function traverse(el) {
      if (condition(el)) {
        results.push(el)
      }

      el.children.forEach((child) => {
        traverse(child)
      })
    }

    traverse(this.dom)
    return results
  }

  get html() {
    var html = []

    function getAttrs(el) {
      var ats = []
      for (var k in el.attrs) { ats.push(` ${k}="${el.attrs[k]}"`) }
      return ats.join('')
    }

    function traverse(el) {
      html.push( `<${el.tag}${getAttrs(el)}>` )

      el.children.forEach((child, idx) => {
        if (child.type == 'element') {
          traverse(child)
        } else {
          html.push(child.value)
        }

        if (idx == el.children.length - 1) {
          html.push(`</${el.tag}>`)
        }
      })
    }

    traverse(this.dom)
    return html.join('')
  }
}

module.exports = Dom