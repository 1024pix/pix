// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */

const { isTopNode } = require('./utils/filters.js');

function transformer(file, api, _options) {
  const jscodeshift = api.jscodeshift;

  // ------------------------------------------------------------------ SEARCH
  const nodes = jscodeshift(file.source)
    .find(jscodeshift.ExpressionStatement, {
      expression: {
        left: {
          object: {
            name: 'module',
          },
          property: {
            name: 'exports',
          },
        },
        operator: '=',
      },
    })
    .filter(isTopNode);

  if (nodes.length > 1) {
    return file.source;
  }

  // if (nodes.paths()[0].node.expression.right?.properties) {
  //   if (nodes.paths()[0].node.expression.right?.properties[0].value?.callee?.name === 'require') {
  //     return file.source;
  //   }
  // }

  // ----------------------------------------------------------------- REPLACE
  return nodes
    .replaceWith((path) => {
      return jscodeshift.exportDefaultDeclaration(path.node.expression.right);
    })
    .toSource();
}

module.exports = transformer;
