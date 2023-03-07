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
        path.node.right.type === 'ClassExpression' ||
        path.node.right.type === 'CallExpression' ||
        path.node.right.type === 'NewExpression' ||
        path.node.right.type === 'FunctionExpression' ||
        (path.node.right.type === 'ObjectExpression' &&
          path.node.right.properties.length > 0 &&
          path.node.right.properties.some((prop) => {
            return prop.value.type !== 'Identifier';
          }))
      );
    });

  if (nodes.length === 0) return file.source;

  console.log('papapa', file);
  return file.source;
}

module.exports = transformer;
