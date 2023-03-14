// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */

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
    .filter((path) => {
      const importPath = path.node.expression.arguments[0].value;
      return importPath.startsWith('.') && importPath.endsWith('.js');
    });

  if (nodes.length === 0) {
    return file.source;
  }

  // ----------------------------------------------------------------- REPLACE
  return nodes
    .replaceWith((path) => {
      const importPath = path.node.expression.arguments[0].value;

      return j.importDeclaration([], j.literal(importPath));
    })
    .toSource({ quote: 'single' });
}

module.exports = transformer;
