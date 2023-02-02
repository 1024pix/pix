// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */

const Logger = require('./utils/logger.js');

function transformer(file, api, options) {
  const j = api.jscodeshift;
  const logger = new Logger(file, options);

  // ------------------------------------------------------------------ SEARCH
  const nodes = j(file.source).find(j.ExpressionStatement, {
    expression: {
      type: 'AssignmentExpression',
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
      operator: '=',
      right: {
        type: 'CallExpression',
        arguments: [
          {
            type: 'ObjectExpression',
            properties: [
              {
                type: 'Property',
                value: {
                  type: 'CallExpression',
                  callee: {
                    type: 'Identifier',
                    name: 'require',
                  },
                },
              },
            ],
          },
        ],
      },
    },
  });
  logger.log(`${nodes.length} nodes will be transformed`);

  // ----------------------------------------------------------------- REPLACE
  return nodes
    .replaceWith((_path) => {
      // if (!_path.node.expression.right.properties) {
      //   return _path;
      // }
      // const importProperties = [];
      // _path.node.expression.right.properties.forEach((property) => {
      //   if (property.value.type !== 'CallExpression' || property.value?.callee?.name !== 'require') {
      //     return;
      //   }
      //   importProperties.push(property);
      // });
      // const newImportStatements = importProperties.map((importProperty) =>
      //   j.importDeclaration(
      //     [
      //       j.importDefaultSpecifier.from({
      //         local: j.identifier(importProperty.key.name),
      //       }),
      //     ],
      //     j.literal(importProperty.value.arguments[0].value)
      //   )
      // );
      // const exportSpecifiers = importProperties.map((importProperty) =>
      //   j.exportSpecifier.from({
      //     exported: j.identifier(importProperty.key.name),
      //     local: j.identifier(importProperty.key.name),
      //   })
      // );
      // const newExportStatement = j.exportNamedDeclaration(null, exportSpecifiers);
      // return newImportStatements.concat(newExportStatement);
      _path.node.expression.right.arguments.properties.forEach((property) => {
        if (property.value.type !== 'CallExpression' || property.value?.callee?.name !== 'require') {
          return;
        }
        importProperties.push(property);
      });
      return j.exportDefaultDeclaration(_path.node.expression.right);
    })
    .toSource({ quote: 'single' });
}

module.exports = transformer;
