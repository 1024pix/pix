// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */

const Logger = require('./utils/logger.js');
const { isTopNode } = require('./utils/filters.js');

function transformer(file, api, options) {
  const j = api.jscodeshift;
  const logger = new Logger(file, options);

  // ------------------------------------------------------------------ SEARCH
  const nodes = j(file.source)
    .find(j.ExpressionStatement, {
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
    })
    .filter(isTopNode);

  if (nodes.length > 1) {
    logger.error('There should not be more than one `module.exports` declaration in a file. Aborting transformation');
    return file.source;
  }

  logger.log(`${nodes.length} nodes will be transformed`);
  // if (nodes.paths()[0].node.expression.right?.properties) {
  //   if (nodes.paths()[0].node.expression.right?.properties[0].value?.callee?.name === 'require') {
  //     return file.source;
  //   }
  // }

  // ----------------------------------------------------------------- REPLACE
  return nodes
    .replaceWith((path) => {
      return j.exportDefaultDeclaration(path.node.expression.right);
    })
    .toSource();
}

module.exports = transformer;
