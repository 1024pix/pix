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
      return path.node.right.type === 'ClassExpression';
    });

  if (nodes.length === 0) {
    return file.source;
  }

  let classExpressionToInsert;

  nodes.map((path) => {
    classExpressionToInsert = path.node.right;
  });

  const className = classExpressionToInsert.id.name;

  j(nodes.paths()[0].parentPath).insertBefore(
    j.classDeclaration(classExpressionToInsert.id, classExpressionToInsert.body, classExpressionToInsert.superClass)
  );

  return nodes
    .replaceWith((path) => {
      const propertyToInsert = j.property('init', j.identifier(className), j.identifier(className));
      return j.assignmentExpression('=', j.identifier('module.exports'), j.objectExpression([propertyToInsert]));
    })
    .toSource(serializationOptions);
}

module.exports = transformer;
