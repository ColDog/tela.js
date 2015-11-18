'use strict'

function parse(tpl, dom) {
  dom = dom || node({}, 'div', null)
  var rehtml = /<([^>]*)>/g
  var stack = [dom]

  function text(val, current) {
    if (typeof val == 'number') { val = tpl.substring(val).match(/[^<]*/)[0].trim() }
    if (val) {
      return {
        type: 'text',
        value: val,
        attrs: {},
        parent: current,
        binding: val.match(/\{\{.*}}/) ? true : false,
        children: []
      }
    }
  }

  function node(attrs, tag, current) {
    return {
      tag: tag,
      type: 'element',
      attrs: attrs,
      parent: current,

      search(condition) {
        var res = []
        this.each( (el) => {
          if (condition(el)) { res.push( el ) }
        })
        return res
      },

      map(fn) {
        function traverse(node) {
          node.children.map((child) => {
            traverse(child)
            fn(child)
          })
        }
        traverse(this)
      },

      remove() {
        this.parent.children.splice(this.parent.children.indexOf(this), 1)
      },

      each(fn) {
        function traverse(node) {
          node.children.forEach((child) => {
            traverse(child)
            fn(child)
          })
        }
        traverse(this)
      },

      set html(val) {
        this.children = parse(val).children.map((child) => { child.parent = this ; return child }) // parent must be redefined.
      },

      add(val, idx) {
        if (typeof idx === 'number') {
          parse(val).children.forEach((child) => {
            child.parent = this
            this.children.splice(idx, 0, child)
            idx += 1
          })
        } else {
          this.children = this.children.concat(
            parse(val).children.map((child) => { child.parent = this ; return child })
          )
        }
      },

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

        traverse(this)
        return html.join('')
      },

      children: []
    }
  }

  // adds any text preceding the first dom tag. this would not be caught
  // before since the matcher immediately starts looking for tags. This is
  // also good if we are just inserting a text element.
  var precedingText = tpl.match(/[^<]*/)[0]
  if (precedingText && precedingText != '') {
    stack[0].children.push( text(precedingText, stack[0]) )
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
      stack.unshift( node(attrs, tag, current) )

      // text strings following start tag end
      var followingText = text(match.index + match[0].length, stack[0])
      if (followingText) { stack[0].children.push(followingText) }
    }

    // Found a closing tag.
    else {
      var trimmed = match[1].trim().replace('/', '');

      for (var i=0;i<stack.length;i++) {
        var element = stack[i];
        if (element.tag === trimmed) {
          stack.splice(i, 1)  // remove from stack
          current = stack[0]  // reset current element important! or could refer to self

          // push this element onto the current elements children
          current.children.push(element)

          // push the text following this tag and in between the next into the children.
          var moreText = text( match.index + match[0].length, current)
          if (moreText) { current.children.push(moreText) }
          break
        }
      }

    }
  }

  return dom
}

module.exports = parse
