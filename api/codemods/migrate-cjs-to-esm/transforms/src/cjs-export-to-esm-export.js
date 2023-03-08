function transformer(file, api, options) {
  const j = api.jscodeshift;

  // ------------------------------------------------------------------ SEARCH
  const nodes = j(file.source).find(j.ExpressionStatement, {
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
  });

  if (nodes.length > 1) {
    throw new Error(
      'There should not be more than one `module.exports` declaration in a file. Aborting transformation'
    );
    return file.source;
  }

  // ----------------------------------------------------------------- REPLACE

  return nodes
    .replaceWith((path) => {
      let specifiers = [];
      path.node.expression.right.properties.map((property) => {
        specifiers.push(
          j.exportSpecifier.from({
            exported: j.identifier(property.value.name),
            local: j.identifier(property.value.name),
          })
        );
      });
      // return j.exportDeclaration(false, path.node.expression.right);
      // return j.exportDeclaration(false, j.identifier('foo'));
      return j.exportDeclaration(false, null, specifiers);
    })
    .toSource();
}

module.exports = transformer;
