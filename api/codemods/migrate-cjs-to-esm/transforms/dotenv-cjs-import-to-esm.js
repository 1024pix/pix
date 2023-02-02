// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */

const Logger = require('./utils/logger.js');

function transformer(file, api, options) {
  const j = api.jscodeshift;
  const logger = new Logger(file, options);

  // ------------------------------------------------------------------ SEARCH
  const nodes = j(file.source).find(j.ExpressionStatement, {
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'require',
          },
          arguments: [
            {
              type: 'Literal',
              value: 'dotenv',
            },
          ],
        },
        property: {
          type: 'Identifier',
          name: 'config',
        },
      },
    },
  });

  logger.log(`${nodes.length} nodes will be transformed`);
  // ----------------------------------------------------------------- REPLACE
  nodes.replaceWith(() => {
    return j.importDeclaration([j.importDefaultSpecifier(j.identifier('dotenv'))], j.literal('dotenv'));
  });
  nodes.insertAfter(
    j.expressionStatement(
      j.callExpression(j.memberExpression(j.identifier('dotenv'), j.identifier('config'), false), [])
    )
  );

  return nodes.toSource({ quote: 'single' });
}

module.exports = transformer;
