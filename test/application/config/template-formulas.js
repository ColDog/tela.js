'use strict';
// todo write formula's and do not save formula's that are wrapped by another formula
module.exports = {
  insert: {
    render: function(element) {
      return this.prop(element.stream || element.prop)
    },
    use: function(element) {
      return element.hasbrace
    }
  },
  react: {
    render: function(element) {
    },
    use: function(element) {
      return element.tag === 'react'
    }
  },
  for: {
    render: function(element) {
    },
    use: function(element) {
      return element.tag === 'for'
    }
  },
  each: {
    render: function(element) {
      var coll = this.prop(element.attrs.stream)
      if (coll) {
        var html = []
        coll.forEach((rec) => {
          html.push(`<${element.tag}>${replaceBraces(element.raw)(rec)}</${element.tag}>`)
        })
        return html.join('')
      }
    },
    use: function(element) {
      return !!element.attrs.each
    }
  }
};


function replaceBraces(raw) {
  var rebraces = /\{{([^}}]+)?}}/g
  var code = []
  var cursor = 0
  var braceMatch
  while(braceMatch = rebraces.exec(raw)) {
    code.push("'" + raw.substring(cursor, braceMatch.index) + "'")
    code.push('self.'+braceMatch[1].trim())
    cursor = braceMatch.index + braceMatch[0].length
  }
  code.push("'" + raw.substring(cursor, raw.length) + "'")
  code = code.join('+')
  return Function('self', 'return ' + code)
}