// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */

const Logger = require('./utils/logger.js');
const { isTopNode } = require('./utils/filters.js');

function transformer(file, api, options) {
  const j = api.jscodeshift;
  const logger = new Logger(file, options);

  // ------------------------------------------------------------------ SEARCH
  // https://astexplorer.net/#/gist/334f5bd39244c7feab38a3fd3cc0ce7f/c332a5b4cbd1a9718e644febf2dce9e9bd032d1b
  const ast = j(file.source);
  const moduleExportNodes = ast
    .find(j.ExpressionStatement, {
      expression: {
        left: {
          object: {
            object: {
              name: 'module',
            },
            property: {
              name: 'exports',
            },
          },
          // property is target
        },
        operator: '=',
      },
    })
    .filter(isTopNode);

  const exportNodes = ast
    .find(j.ExpressionStatement, {
      expression: {
        left: {
          object: {
            name: 'exports',
          },
          // property is target
        },
        operator: '=',
      },
    })
    .filter(isTopNode);

  logger.log(`${moduleExportNodes.length + exportNodes.length} nodes will be transformed`);
  // ----------------------------------------------------------------- REPLACE
  const replace = (path) => {
    const node = path.node;
    // Identifier node
    const id = node.expression.left.property;
    const init = node.expression.right;
    // module.export.b = a
    // → export { a as b }
    if (id.type === 'Identifier' && init.type === 'Identifier') {
      return j.exportNamedDeclaration(null, [j.exportSpecifier.from({ exported: id, local: init })]);
    }
    // https://babeljs.io/docs/en/babel-types#exportnameddeclaration
    const declaration = j.variableDeclaration('const', [j.variableDeclarator(id, init)]);
    return j.exportNamedDeclaration(declaration);
  };

  exportNodes.replaceWith(replace);
  moduleExportNodes.replaceWith(replace);
  return ast.toSource();
}

module.exports = transformer;
