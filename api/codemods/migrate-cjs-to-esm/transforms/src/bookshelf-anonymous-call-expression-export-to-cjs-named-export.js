const serializationOptions = { quote: 'single', trailingComma: true };

function transformer(file, api, _options) {
  const j = api.jscodeshift;
  // ------------------------------------------------------------------ SEARCH
  const nodes = j(file.source)
    .find(j.AssignmentExpression, {
      left: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'module',
        },
        property: {
          type: 'Identifier',
          name: 'exports',
        },
      },
    })
    .filter((path) => {
      return path.node.right.type === 'CallExpression' && path.node.right.callee.object?.name === 'Bookshelf';
    });

  if (nodes.length === 0) {
    return file.source;
  }

  // ----------------------------------------------------------------- REPLACE
  let callExpressionToInsert;

  nodes.map((path) => {
    callExpressionToInsert = path.node.right;
  });

  const variableDeclarationName = callExpressionToInsert.arguments[1].properties[0].value.value;
  const variableDeclarationNameInPascalCase = variableDeclarationName
    .split('-')
    .reduce((acc, curr) => acc + curr.charAt(0).toUpperCase() + curr.slice(1), '');

  const variableDeclarationNameFormated = 'Bookshelf' + variableDeclarationNameInPascalCase.slice(0, -1);

  const variableDeclarationToInsert = j.variableDeclaration('const', [
    j.variableDeclarator(j.identifier(variableDeclarationNameFormated), j.callExpression.from(callExpressionToInsert)),
  ]);

  j(nodes.paths()[0].parentPath).insertBefore(variableDeclarationToInsert);

  return nodes
    .replaceWith((path) => {
      const propertyToInsert = j.property(
        'init',
        j.identifier(variableDeclarationNameFormated),
        j.identifier(variableDeclarationNameFormated)
      );
      return j.assignmentExpression('=', j.identifier('module.exports'), j.objectExpression([propertyToInsert]));
    })
    .toSource(serializationOptions);
}

module.exports = transformer;
