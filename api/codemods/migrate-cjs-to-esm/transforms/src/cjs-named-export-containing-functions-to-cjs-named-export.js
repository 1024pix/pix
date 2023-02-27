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
        path.node.right.type === 'ObjectExpression' &&
        path.node.right.properties.every((property) => property.value.type === 'FunctionExpression')
      );
    });

  if (nodes.length === 0) {
    return file.source;
  }

  // ----------------------------------------------------------------- REPLACE
  let functionNodesToInsert = [];

  nodes.map((path) => {
    functionNodesToInsert = path.node.right.properties;
  });

  const variableDeclarationsToInsert = functionNodesToInsert.map((functionNode) => {
    const params = functionNode.value.params.map((param) => {
      if (!param) return null;
      if(param.type === 'AssignmentPattern') {
        return j.assignmentPattern.from(param);
      }
      return param.type === 'ObjectPattern' ? j.objectPattern(param.properties) : j.identifier(param.name);
    });

    return j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier(functionNode.key.name),
        j.functionExpression.from ({
          id: null,
          params,
          body: j.blockStatement(functionNode.value.body.body),
          async: functionNode.value.async,
        })
      ),
    ]);
  });

  j(nodes.paths()[0].parentPath).insertBefore(variableDeclarationsToInsert);

  return nodes
    .replaceWith((path) => {
      const functionExpressions = path.node.right.properties;
      const functionExpressionsPropertiesToInsert = functionExpressions.map((functionExpression) => {
        return j.property('init', j.identifier(functionExpression.key.name), j.identifier(functionExpression.key.name));
      });
      return j.assignmentExpression(
        '=',
        j.identifier('module.exports'),
        j.objectExpression(functionExpressionsPropertiesToInsert)
      );
    })
    .toSource(serializationOptions);
}

module.exports = transformer;
