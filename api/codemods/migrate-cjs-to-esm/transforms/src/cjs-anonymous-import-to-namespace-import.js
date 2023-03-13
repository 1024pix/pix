// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */

function transformer(file, api, _options) {
  const j = api.jscodeshift;

  // ------------------------------------------------------------------ SEARCH
  const nodes = j(file.source)
    .find(j.VariableDeclaration, {
      declarations: [
        {
          id: {
            type: 'Identifier',
          },
          init: {
            callee: {
              name: 'require',
            },
          },
        },
      ],
    })
    .filter((path) => {
      const importPath = path.node.declarations[0].init.arguments[0].value;
      return importPath.startsWith('.') && importPath.endsWith('.js');
    });

  if (nodes.length === 0) {
    return file.source;
  }

  // ----------------------------------------------------------------- REPLACE
  return nodes
    .replaceWith((path) => {
      const nodeType = path.node.declarations[0].id.type;

      if (nodeType !== 'Identifier') return path.node;


      const importPath = path.node.declarations[0].init.arguments[0].value;
      if(importPath.indexOf('token-service') > -1) {
        return path.node;
      }
      
      let importSpecifiers;
      if (nodeType === 'Identifier' && importPathRegexs.some((regex) => regex.test(importPath))) {
        importSpecifiers = [j.importNamespaceSpecifier(j.identifier(path.node.declarations[0].id.name))];
        return j.importDeclaration(importSpecifiers, j.stringLiteral(importPath));
      } else {
        return path.node;
      }
    })
    .toSource({ quote: 'single' });
}

module.exports = transformer;

const importPathRegexs = [
  new RegExp('.*/utils/bookshelf-to-domain-converter.js$'),
  new RegExp('^./application.*/index.js$'),
  new RegExp('^./usecases/.*.js*$'),
  new RegExp('.*-repository.js*$'),
  new RegExp('.*-service.js*$'),
  new RegExp('.*-serializer.js*$'),
  new RegExp('./datasource.js*$'),
];
