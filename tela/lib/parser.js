'use strict'

function parse(tpl, onelement) {
  var rehtml = /<([^>]*)>/g
  var dom = { tag: 'dom', children: [] }
  var stack = [dom]

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
        attrs: attrs,
        start: match.index,
        begins: match.index + match[0].length,
        children: []
      })

      // Found a closing tag.
    } else {
      var trimmed = match[1].trim().replace('/', '');

      for (var i=0;i<stack.length;i++) {
        var element = stack[i];
        if (element.tag === trimmed) {
          stack.splice(i, 1)  // remove from stack
          current = stack[0]  // reset current element important! or could refer to self

          // update some attributes
          element.end = match.index
          element.raw = tpl.substring(element.begins, match.index).trim()

          // add the hasbrace flag by finding any curly braces
          if (element.raw.match(/\{\{.*}}/)) { element.hasBrace = true }

          // run the onelement callback with the template as an argument
          onelement(element)

          // push this element onto the current elements children
          current.children.push(element)
          break
        }
      }

    }
  }

  return tpl
}

module.exports = parse;
