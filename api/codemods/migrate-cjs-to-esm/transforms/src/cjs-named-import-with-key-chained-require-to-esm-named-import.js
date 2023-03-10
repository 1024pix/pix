// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */
const serializationOptions = { quote: 'single', trailingComma: true };

function transformer(file, api, _options) {
  const j = api.jscodeshift;

  // ------------------------------------------------------------------ SEARCH
  const nodes = j(file.source).find(j.VariableDeclaration, {
    declarations: [
      {
        id: {
          type: 'ObjectPattern',
        },
        init: {
          object: {
            type: 'CallExpression',
            callee: {
              name: 'require',
            },
          },
          property: {
            type: 'Identifier',
          },
        },
      },
    ],
  });

  if (nodes.length === 0) {
    return file.source;
  }

  // ----------------------------------------------------------------- REPLACE
  const declaration = nodes.paths()[0].node.declarations[0];
  const propertyName = declaration.init.property.name;
  const objectPropertiesToImport = declaration.id.properties.map((p) => {
    return j.property.from({
      kind: 'init',
      key: j.identifier(p.key.name),
      value: j.identifier(p.key.name),
      shorthand: true,
    });
  });

  const variableDeclarationToInsert = j.variableDeclaration('const', [
    j.variableDeclarator(j.objectPattern(objectPropertiesToImport), j.identifier(propertyName)),
  ]);

  j(nodes.paths()[0]).insertAfter(variableDeclarationToInsert);

  return nodes
    .replaceWith((path) => {
      const nodeType = path.node.declarations[0].id.type;

      if (nodeType !== 'ObjectPattern' && nodeType !== 'Identifier') return path.node;

      const importPath = path.node.declarations[0].init.object.arguments[0].value;
      const importSpecifier = j.importSpecifier(j.identifier(propertyName));

      return j.importDeclaration([importSpecifier], j.stringLiteral(importPath));
    })
    .toSource(serializationOptions);
}

module.exports = transformer;
