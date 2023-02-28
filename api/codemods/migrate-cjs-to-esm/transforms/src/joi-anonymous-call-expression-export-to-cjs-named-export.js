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
      return (
        path.node.right.type === 'CallExpression' &&
        (path.node.right.callee?.object?.callee?.object?.name === 'Joi' ||
          path.node.right.callee?.object?.name === 'Joi')
      );
    });

  if (nodes.length === 0) {
    return file.source;
  }
  // ----------------------------------------------------------------- REPLACE
  let callExpressionToInsert;

  nodes.map((path) => {
    callExpressionToInsert = path.node.right;
  });

  const variableDeclarationName = 'joiObject';

  const variableDeclarationToInsert = j.variableDeclaration('const', [
    j.variableDeclarator(j.identifier(variableDeclarationName), j.callExpression.from(callExpressionToInsert)),
  ]);

  j(nodes.paths()[0].parentPath).insertBefore(variableDeclarationToInsert);

  return nodes
    .replaceWith((path) => {
      const propertyToInsert = j.property(
        'init',
        j.identifier(variableDeclarationName),
        j.identifier(variableDeclarationName)
      );
      return j.assignmentExpression('=', j.identifier('module.exports'), j.objectExpression([propertyToInsert]));
    })
    .toSource(serializationOptions);
}

module.exports = transformer;
