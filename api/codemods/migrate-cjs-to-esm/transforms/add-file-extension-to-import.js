// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */

const { isTopNode } = require('./utils/filters.js');

function transformer(file, api, _options) {
  const j = api.jscodeshift;

  // ------------------------------------------------------------------ SEARCH
  const nodes = j(file.source)
    .find(j.ExpressionStatement, {
      expression: {
        callee: {
          name: 'require',
        },
      },
    })
    .filter(isTopNode);

  // ----------------------------------------------------------------- REPLACE
  return nodes
    .replaceWith((path) => {
      const sourcePath = path.node.expression.arguments.pop();
      return j.importDeclaration([], sourcePath);
    })
    .toSource();
}

module.exports = transformer;
