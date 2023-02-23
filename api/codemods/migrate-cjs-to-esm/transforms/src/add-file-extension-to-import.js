// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */
const util = require('util');

function transformer(file, api, _options) {
  const j = api.jscodeshift;

  // ------------------------------------------------------------------ SEARCH
  const nodes = j(file.source)
    .find(j.CallExpression, {
      callee: {
        type: 'Identifier',
        name: 'require',
      },
    })
    .filter((path) => {
      return (
        path.node.arguments[0].value.startsWith('.') &&
        !path.node.arguments[0].value.endsWith('.js') &&
        !path.node.arguments[0].value.endsWith('.json')
      );
    });

  // ----------------------------------------------------------------- REPLACE
  return nodes
    .replaceWith((path) => {
      const sourcePath = path.node.arguments.pop();
      return j.callExpression(j.identifier('require'), [j.literal(`${sourcePath.value}.js`)]);
    })
    .toSource({ quote: 'single' });
}

module.exports = transformer;
