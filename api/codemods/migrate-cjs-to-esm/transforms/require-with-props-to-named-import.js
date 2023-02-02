// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */

const Logger = require('./utils/logger.js');
const { isTopNode } = require('./utils/filters.js');
const { P } = require('pino');

function transformer(file, api, options) {
  const j = api.jscodeshift;
  const logger = new Logger(file, options);

  // ------------------------------------------------------------------ SEARCH
  const nodes = j(file.source)
    .find(j.VariableDeclaration, {
      declarations: [
        {
          init: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: {
                name: 'require',
              },
            },
            // property
          },
        },
      ],
    })
    .filter(isTopNode);

  logger.log(`${nodes.length} nodes will be transformed`);
  // ----------------------------------------------------------------- REPLACE
  // nodes.paths().forEach((path) => console.log(path.node));
  return nodes
    .replaceWith((path) => {
      const rest = [];
      const imports = [];
      for (const declaration of path.node.declarations) {
        // https://astexplorer.net/#/gist/49d222c86971cbe3e5744958989dc061/b0b5d0c31a6e74f63365c2ec1f195d3227c49621
        // const a = require("a").a
        const isRequireWithProp =
          declaration.init !== null &&
          declaration.init.type === 'MemberExpression' &&
          declaration.init.object.type === 'CallExpression' &&
          declaration.init.object.callee.name === 'require' &&
          declaration.init.property !== undefined;
        if (isRequireWithProp) {
          if (declaration?.init?.property.type !== 'Identifier') {
            logger.log('Unknown declaration', declaration);
            return file.source;
          }
          if (declaration.id.type === 'Identifier') {
            const sourcePath = declaration.init.object.arguments.shift();
            if (declaration.init.object.arguments.length) {
              logger.error(`${logger.lines(declaration)} too many arguments.` + 'Aborting transformation');
              return file.source;
            }
            if (!j.Literal.check(sourcePath)) {
              logger.error(
                `${logger.lines(declaration)} bad argument.` +
                  'Expecting a string literal, got ' +
                  j(sourcePath).toSource() +
                  '`. Aborting transformation'
              );
              return file.source;
            }
            const specify = j.importSpecifier(declaration.init.property, declaration.id);
            imports.push(j.importDeclaration([specify], sourcePath));
          } else if (declaration.id.type === 'ObjectPattern') {
            const sourcePath = declaration.init.object.arguments.shift().value;
            imports.push(j.importDeclaration([j.importSpecifier(declaration.init.property)], j.literal(sourcePath)));

            // named import
            // const { c } = require("mod").a

            const propertyName = declaration.init.property.name;
            const objectPropertiesToImport = declaration.id.properties.map((p) => {
              return j.property('init', j.identifier(p.key.name), j.identifier(p.key.name));
            });
            imports.push(
              j.variableDeclaration('const', [
                j.variableDeclarator(j.objectPattern(objectPropertiesToImport), j.identifier(propertyName)),
              ])
            );
          }
        } else {
          rest.push(declaration);
        }
      }
      if (rest.length > 0) {
        logger.warn(`${logger.lines(path.node)} introduced leftover`);
        return [...imports, j.variableDeclaration(path.node.kind, rest)];
      }
      return imports;
    })
    .toSource({ quote: 'single' });
}

module.exports = transformer;
