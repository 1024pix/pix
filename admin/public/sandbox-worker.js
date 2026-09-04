(function () {
  'use strict';

  var pendingCalls = new Map();

  var tools = {
    call: function call(name, args, options) {
      var ligne = (options && options.ligne) !== undefined ? options.ligne : undefined;
      var id = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      var p = new Promise(function (resolve) {
        pendingCalls.set(id, resolve);
      });
      self.postMessage({ type: 'tool.call', id: id, name: name, args: args, ligne: ligne });
      return p;
    },
  };

  self.addEventListener('message', function (e) {
    var data = e.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'init') {
      var sheets = data.sheets;
      var userScript = data.script;
      Promise.resolve()
        .then(function () {
          return new Function(
            'sheets',
            'tools',
            '"use strict";\nreturn (async function() {\n' + userScript + '\n})();',
          )(sheets, tools);
        })
        .then(function (result) {
          if (
            Array.isArray(result) &&
            result.length > 0 &&
            result.every(function (r) {
              return r !== null && typeof r === 'object' && typeof r.then === 'function';
            })
          ) {
            return Promise.all(result);
          }
          return result;
        })
        .then(function (result) {
          self.postMessage({ type: 'done', result: result !== undefined ? result : null });
        })
        .catch(function (err) {
          self.postMessage({ type: 'error', message: err && err.message ? err.message : String(err) });
        });
    }

    if (data.type === 'tool.result') {
      var resolve = pendingCalls.get(data.id);
      if (resolve) {
        pendingCalls.delete(data.id);
        resolve(data.result);
      }
    }
  });
})();
