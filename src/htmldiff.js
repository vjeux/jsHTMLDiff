(function() {

  window.HTMLDiff = (function() {

    function HTMLDiff(a, b) {
      this.a = a;
      this.b = b;
    }

    HTMLDiff.prototype.diff = function() {
      var diff, tokens_a, tokens_b;
      tokens_a = tokens_b = this.tokenize(this.b);
      diff = this.diff_list(this.tokenize(this.a), this.tokenize(this.b));
      this.update(this.a, diff.filter(function(_arg) {
        var status, text;
        status = _arg[0], text = _arg[1];
        return status !== '+';
      }));
      return this.update(this.b, diff.filter(function(_arg) {
        var status, text;
        status = _arg[0], text = _arg[1];
        return status !== '-';
      }));
    };

    HTMLDiff.prototype.parseTextNodes = function(node, callback) {
      var handleNode;
      handleNode = function(node) {
        var n, new_node, new_nodes, old_node, _i, _j, _len, _len2, _ref;
        if (node.nodeType === 3) {
          if (!/^\s*$/.test(node.nodeValue)) return callback(node);
        } else {
          _ref = (function() {
            var _j, _len, _ref, _results;
            _ref = node.childNodes;
            _results = [];
            for (_j = 0, _len = _ref.length; _j < _len; _j++) {
              n = _ref[_j];
              _results.push(n);
            }
            return _results;
          })();
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            old_node = _ref[_i];
            new_nodes = handleNode(old_node);
            if (new_nodes) {
              for (_j = 0, _len2 = new_nodes.length; _j < _len2; _j++) {
                new_node = new_nodes[_j];
                node.insertBefore(new_node, old_node);
              }
              node.removeChild(old_node);
            }
          }
          return false;
        }
      };
      return handleNode(node);
    };

    HTMLDiff.prototype.tokenize = function(root) {
      var tokens;
      tokens = [];
      this.parseTextNodes(root, function(node) {
        tokens = tokens.concat(node.nodeValue.split(' '));
        return false;
      });
      return tokens;
    };

    HTMLDiff.prototype.update = function(root, diff) {
      var pos;
      pos = 0;
      return this.parseTextNodes(root, function(node) {
        var end, ins_node, new_node, new_nodes, output, part, start, status, text, _i, _len, _ref;
        start = pos;
        end = pos + (node.nodeValue.split(' ')).length;
        pos = end;
        output = (function() {
          var _i, _len, _ref, _ref2, _results;
          _ref = diff.slice(start, end);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            _ref2 = _ref[_i], status = _ref2[0], text = _ref2[1];
            if (status === '=') {
              _results.push(text);
            } else {
              _results.push('<ins>' + text + '</ins>');
            }
          }
          return _results;
        })();
        output = output.join(' ').replace(/<\/ins> <ins>/g, ' ').replace(/<ins> /g, ' <ins>').replace(/[ ]<\/ins>/g, '</ins> ').replace(/<ins><\/ins>/g, '');
        new_nodes = [];
        new_node = document.createTextNode();
        new_nodes.push(new_node);
        _ref = output.split(/(<\/?ins>)/);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          part = _ref[_i];
          switch (part) {
            case '<ins>':
              ins_node = document.createElement('ins');
              new_nodes.push(ins_node);
              new_node = document.createTextNode();
              ins_node.appendChild(new_node);
              break;
            case '</ins>':
              new_node = document.createTextNode();
              new_nodes.push(new_node);
              break;
            default:
              new_node.nodeValue = part;
          }
        }
        return new_nodes.filter(function(node) {
          return !(node.nodeType === 3 && node.nodeValue === '');
        });
      });
    };

    HTMLDiff.prototype.diff_list = function(before, after) {
      var i, j, k, lastRow, ohash, subLength, subStartAfter, subStartBefore, thisRow, val, _i, _len, _len2, _len3, _ref, _ref2;
      ohash = {};
      for (i = 0, _len = before.length; i < _len; i++) {
        val = before[i];
        if (!(val in ohash)) ohash[val] = [];
        ohash[val].push(i);
      }
      lastRow = (function() {
        var _ref, _results;
        _results = [];
        for (i = 0, _ref = before.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          _results.push(0);
        }
        return _results;
      })();
      subStartBefore = subStartAfter = subLength = 0;
      for (j = 0, _len2 = after.length; j < _len2; j++) {
        val = after[j];
        thisRow = (function() {
          var _ref, _results;
          _results = [];
          for (i = 0, _ref = before.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
            _results.push(0);
          }
          return _results;
        })();
        _ref2 = (_ref = ohash[val]) != null ? _ref : [];
        for (_i = 0, _len3 = _ref2.length; _i < _len3; _i++) {
          k = _ref2[_i];
          thisRow[k] = (k && lastRow[k - 1] ? 1 : 0) + 1;
          if (thisRow[k] > subLength) {
            subLength = thisRow[k];
            subStartBefore = k - subLength + 1;
            subStartAfter = j - subLength + 1;
          }
        }
        lastRow = thisRow;
      }
      if (subLength === 0) {
        return [].concat((function() {
          var _j, _len4, _results;
          _results = [];
          for (_j = 0, _len4 = before.length; _j < _len4; _j++) {
            val = before[_j];
            _results.push(['-', val]);
          }
          return _results;
        })(), (function() {
          var _j, _len4, _results;
          _results = [];
          for (_j = 0, _len4 = after.length; _j < _len4; _j++) {
            val = after[_j];
            _results.push(['+', val]);
          }
          return _results;
        })());
      } else {
        return [].concat(this.diff_list(before.slice(0, subStartBefore), after.slice(0, subStartAfter)), (function() {
          var _j, _len4, _ref3, _results;
          _ref3 = after.slice(subStartAfter, (subStartAfter + subLength));
          _results = [];
          for (_j = 0, _len4 = _ref3.length; _j < _len4; _j++) {
            val = _ref3[_j];
            _results.push(['=', val]);
          }
          return _results;
        })(), this.diff_list(before.slice(subStartBefore + subLength), after.slice(subStartAfter + subLength)));
      }
    };

    return HTMLDiff;

  })();

}).call(this);
