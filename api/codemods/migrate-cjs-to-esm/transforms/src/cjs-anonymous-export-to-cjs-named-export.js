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
      return path.node.right.type === 'Identifier';
    });

  if (nodes.length === 0) {
    return file.source;
  }
  // ----------------------------------------------------------------- REPLACE
  return nodes
    .replaceWith((path) => {
      const identifierName = path.node.right.name;
      return j.assignmentExpression(
        '=',
        j.memberExpression(j.identifier('module'), j.identifier('exports'), false),
        j.objectExpression([j.property('init', j.identifier(identifierName), j.identifier(identifierName))])
      );
    })
    .toSource({ quote: 'single' });
}

module.exports = transformer;
