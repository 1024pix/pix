// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */

function transformer(file, api, _options) {
  const j = api.jscodeshift;

  // ------------------------------------------------------------------ SEARCH
  const nodes = j(file.source).find(j.VariableDeclaration, {
    declarations: [
      {
        init: {
          callee: {
            name: 'require',
          },
        },
      },
    ],
  }).filter((path) => {
    const importPath = path.node.declarations[0].init.arguments[0].value;
    return importPath.startsWith('.') && importPath.endsWith('.js');
  });

  if (nodes.length === 0) {
    return file.source;
  }
  // ----------------------------------------------------------------- REPLACE
  return nodes
    .replaceWith((path) => {
      const nodeType = path.node.declarations[0].id.type;

      if (nodeType !== 'ObjectPattern' && nodeType !== 'Identifier') return path.node;

      const importPath = path.node.declarations[0].init.arguments[0].value;
      let importSpecifiers;

      if (nodeType === 'Identifier') {
        importSpecifiers = [j.importSpecifier(j.identifier(path.node.declarations[0].id.name))];
      }

      if (nodeType === 'ObjectPattern') {
        importSpecifiers = path.node.declarations[0].id.properties.map((property) => {
          if (property.shorthand) {
            return j.importSpecifier(j.identifier(property.key.name));
          } else {
            return j.importSpecifier(j.identifier(property.key.name), j.identifier(property.value.name));
          }
        });
      }

      return j.importDeclaration(importSpecifiers, j.stringLiteral(importPath));
    })
    .toSource({ quote: 'single' });
}

module.exports = transformer;
