const serializationOptions = { quote: 'single', trailingComma: true };

function transformer(file, api, _options) {
  const j = api.jscodeshift;
  let functionNode;
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
      return path.node.right.type === 'FunctionExpression';
    });

  if (nodes.length === 0) {
    return file.source;
  }
  // ----------------------------------------------------------------- REPLACE

  nodes.map((path) => {
    functionNode = path.node.right;
  });

  const params = functionNode.params.map((param) => {
    if (!param) return null;
    if(param.type === 'AssignmentPattern') {
      return j.assignmentPattern.from(param);
    }
    return param.type === 'ObjectPattern' ? j.objectPattern(param.properties) : j.identifier(param.name);
  });

  const nodeToInsert = j.variableDeclaration('const', [
    j.variableDeclarator(
      j.identifier(functionNode.id.name),
      j.functionExpression.from({
        id: null,
        params,
        body: j.blockStatement(functionNode.body.body),
        async: functionNode.async,
      })
    ),
  ]);

  j(nodes.paths()[0].parentPath).insertBefore(nodeToInsert);

  return nodes
    .replaceWith((path) => {
      const functionIdentifier = j.identifier(path.node.right.id.name);
      return j.assignmentExpression(
        '=',
        j.identifier('module.exports'),
        j.objectExpression([j.property('init', functionIdentifier, functionIdentifier)])
      );
    })
    .toSource(serializationOptions);
}

module.exports = transformer;
