const jscodeshift = require('jscodeshift');
const fs = require('node:fs');
const transform = require('./inject-dependencies-codemod');

// Mock the dependencies directly for debugging
const mockIndexContent = `
import * as badgeRepository from '../../infrastructure/repositories/badge-repository.js';

const dependencies = {
  badgeRepository,
};
`;

fs.writeFileSync('/tmp/index.js', mockIndexContent);

const source = `
const deleteUnassociatedBadge = async function ({ badgeId, badgeRepository }) {
  return badgeRepository.delete(badgeId);
};

export { deleteUnassociatedBadge };
`.trim();

console.log('=== DEBUGGING TRANSFORM ===');

// Add debug logs to transform
const originalTransform = transform;
const debugTransform = function (source, api, options) {
  console.log(`\n🔧 Transform called with path: ${options.path}`);

  const j = api.jscodeshift;
  const root = j(source);
  const filePath = options.path || '';

  // Extract dependencies from the corresponding index.js file
  const extractDependenciesFromIndexFile = function (usecaseFilePath) {
    try {
      const path = require('node:path');
      const usecaseDir = path.dirname(usecaseFilePath);
      const indexFilePath = path.join(usecaseDir, 'index.js');

      console.log(`📁 Looking for index at: ${indexFilePath}`);

      if (!fs.existsSync(indexFilePath)) {
        console.warn(`Index file not found: ${indexFilePath}`);
        return {};
      }

      const indexContent = fs.readFileSync(indexFilePath, 'utf8');
      const indexAst = j(indexContent);
      const dependencies = {};

      // Extract import statements and map them to dependency names
      indexAst.find(j.ImportDeclaration).forEach((importPath) => {
        const node = importPath.node;
        if (node.specifiers && node.specifiers.length > 0) {
          const specifier = node.specifiers[0];
          if (specifier.type === 'ImportNamespaceSpecifier') {
            const localName = specifier.local.name;
            const importSource = node.source.value;
            dependencies[localName] = importSource;
            console.log(`📦 Found import: ${localName} -> ${importSource}`);
          }
        }
      });

      console.log(`✅ Dependencies found:`, dependencies);
      return dependencies;
    } catch (error) {
      console.warn(`❌ Error reading index file for ${usecaseFilePath}:`, error.message);
      return {};
    }
  };

  const dependencies = extractDependenciesFromIndexFile(filePath);

  if (Object.keys(dependencies).length === 0) {
    console.warn(`⚠️ No dependencies found for ${filePath}`);
    return source;
  }

  const importsToAdd = new Set();
  const usedDependencies = new Set();

  console.log(`🔍 Scanning functions...`);

  // Find all function declarations and expressions that might be usecases
  const functionTypes = [j.FunctionDeclaration, j.FunctionExpression, j.ArrowFunctionExpression];

  functionTypes.forEach((funcType) => {
    root.find(funcType).forEach((funcPath) => {
      const func = funcPath.node;

      // Skip functions without parameters or with non-destructuring parameters
      if (!func.params || func.params.length === 0) return;

      const firstParam = func.params[0];
      if (firstParam.type !== 'ObjectPattern') return;

      console.log(`🎯 Found function with destructuring params`);

      // Analyze destructuring properties to find dependency parameters
      const properties = firstParam.properties || [];
      let hasUsedDependencies = false;

      properties.forEach((prop) => {
        if (prop.type === 'Property' && prop.key.type === 'Identifier') {
          const paramName = prop.key.name;
          console.log(`🔑 Checking parameter: ${paramName}`);

          // Check if this parameter matches a known dependency
          if (dependencies[paramName]) {
            console.log(`✅ Found matching dependency: ${paramName}`);
            const injectedName = `injected${paramName.charAt(0).toUpperCase() + paramName.slice(1)}`;
            const importPath = dependencies[paramName];
            const path = require('node:path');
            const relativePath = path.relative(
              path.dirname(filePath),
              path.resolve(path.dirname(filePath), importPath),
            );
            const normalizedPath = relativePath.replace(/\\/g, '/') + (relativePath.endsWith('.js') ? '' : '.js');

            console.log(`📄 Adding import: import * as ${injectedName} from '${normalizedPath}';`);
            importsToAdd.add(`import * as ${injectedName} from '${normalizedPath}';`);
            usedDependencies.add(paramName);
            hasUsedDependencies = true;

            // Transform the property to have a default value
            if (prop.value && prop.value.type === 'Identifier' && prop.value.name === paramName) {
              // Simple property shorthand: { badgeRepository }
              prop.value = j.assignmentPattern(j.identifier(paramName), j.identifier(injectedName));
            } else if (!prop.value) {
              // Property shorthand: { badgeRepository } (no explicit value)
              prop.value = j.assignmentPattern(j.identifier(paramName), j.identifier(injectedName));
            }
          }
        }
      });

      // If we found dependencies, ensure the function parameter has a default empty object
      if (hasUsedDependencies) {
        console.log(`🔧 Adding default empty object to function params`);
        if (firstParam.type === 'ObjectPattern' && func.params.length === 1) {
          func.params[0] = j.assignmentPattern(firstParam, j.objectExpression([]));
        }
      }
    });
  });

  console.log(`📦 Imports to add:`, Array.from(importsToAdd));

  // Add imports at the beginning of the file
  if (importsToAdd.size > 0) {
    const existingImports = root.find(j.ImportDeclaration);
    const importStatements = Array.from(importsToAdd).map((importStr) => {
      const importAst = j(importStr);
      return importAst.find(j.ImportDeclaration).at(0).get().node;
    });

    if (existingImports.length > 0) {
      console.log(`📋 Adding imports after existing imports`);
      // Add after existing imports
      existingImports.at(-1).insertAfter(importStatements);
    } else {
      console.log(`📋 Adding imports at beginning of file`);
      // Add at the beginning of the file
      const program = root.find(j.Program);
      if (program.length > 0) {
        const body = program.get('body');
        console.log(`📋 Body before:`, body.value.length, 'statements');
        body.unshift(...importStatements);
        console.log(`📋 Body after:`, body.value.length, 'statements');
        console.log(`📋 First statement is now:`, body.value[0]?.type);
      } else {
        console.log(`❌ No program found in AST`);
      }
    }
  }

  console.log(`✨ Transform complete`);
  return root.toSource({ quote: 'single', trailingComma: true });
};

const result = debugTransform(
  source,
  { jscodeshift },
  {
    path: '/tmp/delete-unassociated-badge.js',
  },
);

console.log('ORIGINAL:');
console.log(source);
console.log('\nTRANSFORMED:');
console.log(result);

// Test dependency extraction directly
const extractDependenciesFromIndexFile = function (usecaseFilePath) {
  const usecaseDir = require('node:path').dirname(usecaseFilePath);
  const indexFilePath = require('node:path').join(usecaseDir, 'index.js');

  if (!fs.existsSync(indexFilePath)) {
    console.warn(`Index file not found: ${indexFilePath}`);
    return {};
  }

  const indexContent = fs.readFileSync(indexFilePath, 'utf8');
  console.log('\nINDEX CONTENT:');
  console.log(indexContent);

  const indexAst = jscodeshift(indexContent);
  const dependencies = {};

  // Extract import statements and map them to dependency names
  indexAst.find(jscodeshift.ImportDeclaration).forEach((importPath) => {
    const node = importPath.node;
    if (node.specifiers && node.specifiers.length > 0) {
      const specifier = node.specifiers[0];
      if (specifier.type === 'ImportNamespaceSpecifier') {
        const localName = specifier.local.name;
        const importSource = node.source.value;
        dependencies[localName] = importSource;
        console.log(`Found import: ${localName} -> ${importSource}`);
      }
    }
  });

  return dependencies;
};

console.log('\nDEPENDENCIES:');
const deps = extractDependenciesFromIndexFile('/tmp/delete-unassociated-badge.js');
console.log(deps);
