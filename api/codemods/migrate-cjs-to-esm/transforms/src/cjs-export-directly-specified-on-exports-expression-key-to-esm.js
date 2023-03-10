const serializationOptions = { quote: 'single', trailingComma: true };

function transformer(file, api, _options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  // ------------------------------------------------------------------ SEARCH
  const nodes = root
    .find(j.ExpressionStatement, {
      expression: {
        type: 'AssignmentExpression',

        left: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'exports',
          },
          property: {
            type: 'Identifier',
          },
        },
      },
    })
    .filter((path) => {
      return (
        path.node.expression.right.type === 'ArrowFunctionExpression' ||
        path.node.expression.right.type === 'FunctionExpression' ||
        path.node.expression.right.type === 'Literal'
      );
    });

  if (nodes.length === 0) {
    return file.source;
  }

  // ----------------------------------------------------------------- REPLACE

  const variableDeclarationsToInsert = [];
  const keysToExport = [];
  nodes.forEach((path) => {
    const key = path.node.expression.left.property.name;
    keysToExport.push(key);
    const nodeType = path.node.expression.right.type;
    if (nodeType === 'Literal') {
      variableDeclarationsToInsert.push(
        j.variableDeclaration('const', [
          j.variableDeclarator(j.identifier(key), j.literal(path.node.expression.right.value)),
        ])
      );
    }
    if (nodeType === 'ArrowFunctionExpression' || nodeType === 'FunctionExpression') {
      const functionNode = path.node.expression.right;
      const params = functionNode.params.map((param) => {
        if (!param) return null;
        if (param.type === 'AssignmentPattern') {
          return j.assignmentPattern.from(param);
        }
        return param.type === 'ObjectPattern' ? j.objectPattern(param.properties) : j.identifier(param.name);
      });

      variableDeclarationsToInsert.push(
        j.variableDeclaration('const', [
          j.variableDeclarator(
            j.identifier(key),
            j.functionExpression.from({
              id: null,
              params,
              body: j.blockStatement(functionNode.body.body),
              async: functionNode.async,
            })
          ),
        ])
      );
    }
  });

  variableDeclarationsToInsert.push(
    j.exportDeclaration(
      false,
      null,
      keysToExport.map((key) =>
        j.exportSpecifier.from({
          exported: j.identifier(key),
          local: j.identifier(key),
        })
      )
    )
  );

  j(nodes.paths()[0]).insertAfter(variableDeclarationsToInsert);

  nodes.remove();

  return root.toSource(serializationOptions);
}

module.exports = transformer;
