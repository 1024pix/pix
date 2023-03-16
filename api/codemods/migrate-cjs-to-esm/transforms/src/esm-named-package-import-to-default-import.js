// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */

function transformer(file, api, _options) {
  const j = api.jscodeshift;

  // ------------------------------------------------------------------ SEARCH
  const nodes = j(file.source)
    .find(j.ImportDeclaration, {
      specifiers: [
        {
          type: 'ImportSpecifier',
        },
      ],
    })
    .filter((path) => {
      const importPath = path.node.source.value;
      return !importPath.startsWith('.') && !importPath.endsWith('.js');
    });

  if (nodes.length === 0) {
    return file.source;
  }

  const variableDeclarationsToInsert = [];

  nodes.forEach((path) => {
    variableDeclarationsToInsert.push({
      properties: path.node.specifiers.map((specifier) => {
        return j.property.from({
          kind: 'init',
          key: j.identifier(specifier.imported.name),
          value: j.identifier(specifier.imported.name),
          shorthand: true,
        });
      }),
      importPath: convertStringToCamelCase(path.node.source.value),
    });
  });

  variableDeclarationsToInsert.forEach((variableDeclarationToInsert) => {
    const builtVariableDeclarationToInsert = j.variableDeclaration('const', [
      j.variableDeclarator(
        j.objectPattern(variableDeclarationToInsert.properties),
        j.identifier(variableDeclarationToInsert.importPath)
      ),
    ]);

    j(nodes.paths()[0]).insertAfter(builtVariableDeclarationToInsert);
  });

  // ----------------------------------------------------------------- REPLACE
  nodes.replaceWith((path) => {
    const importPath = path.node.source.value;
    const camelCaseImportPath = convertStringToCamelCase(importPath);
    const importSpecifiers = [j.importDefaultSpecifier(j.identifier(camelCaseImportPath))];
    return j.importDeclaration(importSpecifiers, j.stringLiteral(importPath));
  });

  return nodes.toSource({ quote: 'single' });
}

module.exports = transformer;

const convertStringToCamelCase = (stringToConvert) => {
  return stringToConvert
    .split('-')
    .reduce(
      (acc, curr, index) => acc + (index === 0 ? curr.charAt(0) : curr.charAt(0).toUpperCase()) + curr.slice(1),
      ''
    );
};
