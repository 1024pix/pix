// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */

const { isTopNode } = require('./utils/filters.js');

function transformer(file, api, _options) {
  const j = api.jscodeshift;

  // ------------------------------------------------------------------ SEARCH
  const nodes = j(file.source)
    .find(j.VariableDeclaration, {
      declarations: [
        {
          init: {
            type: 'CallExpression',
            callee: {
              name: 'require',
            },
            // property
          },
        },
      ],
    })
    .filter(isTopNode);

  // ----------------------------------------------------------------- REPLACE
  return nodes
    .replaceWith((path) => {
      const rest = [];
      const imports = [];
      for (const declaration of path.node.declarations) {
        const isRequire =
          declaration.init !== null &&
          declaration.init.type === 'CallExpression' &&
          declaration.init.callee.name === 'require';
        // https://astexplorer.net/#/gist/49d222c86971cbe3e5744958989dc061/b0b5d0c31a6e74f63365c2ec1f195d3227c49621
        // require("a").a
        const isRequireWithProp = isRequire && declaration.init.property !== undefined;
        if (isRequireWithProp) {
          if (declaration.id.type === 'Identifier') {
            // default import
            const sourcePath = declaration.init.arguments.shift();
            if (declaration.init.arguments.length) {
              return file.source;
            }
            if (!j.Literal.check(sourcePath)) {
              return file.source;
            }
            const specify = j.importSpecifier(declaration.init.property, declaration?.init?.property);
            imports.push(j.importDeclaration([specify], sourcePath));
          } else if (declaration.id.type === 'ObjectPattern') {
            // named import
            // const { c } = require("mod").a
          }
        } else if (isRequire) {
          if (declaration.id.type === 'Identifier') {
            // default import
            const importSpecifier = j.importDefaultSpecifier(declaration.id);
            const sourcePath = declaration.init.arguments.shift();
            if (declaration.init.arguments.length) {
              return file.source;
            }
            if (!j.Literal.check(sourcePath)) {
              return file.source;
            }
            imports.push(j.importDeclaration([importSpecifier], sourcePath));
          } else if (declaration.id.type === 'ObjectPattern') {
            // named import
            // const { specifierA, specifierB } = require("mod")
            // ObjectPattern
            const specifiers = declaration.id.properties.map((property) => {
              const key = j.identifier(property.key.name);
              const value = j.identifier(property.value.name);
              return j.importSpecifier(key, value);
            });
            const sourcePath = declaration.init.arguments.shift();
            if (declaration.init.arguments.length) {
              return file.source;
            }
            if (!j.Literal.check(sourcePath)) {
              return file.source;
            }
            imports.push(j.importDeclaration(specifiers, sourcePath));
          }
        } else {
          rest.push(declaration);
        }
      }
      if (rest.length > 0) {
        return [...imports, j.variableDeclaration(path.node.kind, rest)];
      }
      return imports;
    })
    .toSource();
}

module.exports = transformer;
