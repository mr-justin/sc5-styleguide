'use strict';

var marked = require('gulp-marked'),
  vfs = require('vinyl-fs');

module.exports = {

  getStream: function(filePath) {
    var renderer = this.getRenderer();
    return vfs.src(filePath)
      .pipe(marked({renderer: renderer}))
  },

  getRenderer: function() {
    var renderer = {};
    // Define custom renderers for markup blocks
    renderer.heading = function(text, level) {
      return '<h' + level + ' class="sg">' + text + '</h' + level + '>';
    };
    renderer.paragraph = function(text) {
      return '<p class="sg">' + text + '</p>';
    };
    renderer.listitem = function(text) {
      return '<li class="sg">' + text + '</li>\n';
    };
    renderer.link = function(href, title, text) {
      if (this.options.sanitize) {
        try {
          var prot = decodeURIComponent(unescape(href))
            .replace(/[^\w:]/g, '')
            .toLowerCase();
        } catch (e) {
          return '';
        }
        if (prot.indexOf('javascript:') === 0) {
          return '';
        }
      }
      var out = '<a class="sg" href="' + href + '"';
      if (title) {
        out += ' title="' + title + '"';
      }
      out += '>' + text + '</a>';
      return out;
    };
    renderer.code = function(code, lang, escaped) {
      var htmlEscape = function(html, encode) {
        return html
          .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      if (this.options.highlight) {
        var out = this.options.highlight(code, lang);
        if (out != null && out !== code) {
          escaped = true;
          code = out;
        }
      }

      if (!lang) {
        return '<pre class="sg"><code>'
          + (escaped ? code : htmlEscape(code, true))
          + '\n</code></pre>';
      }

      return '<pre class="sg"><code class="'
        + this.options.langPrefix
        + htmlEscape(lang, true)
        + '">'
        + (escaped ? code : htmlEscape(code, true))
        + '\n</code></pre>\n';
    }
    return renderer;
  }

}