const jscodeshift = require('jscodeshift');
const fs = require('node:fs');

/**
 * This codemod removes the dependency injection system from index.js files in domain/usecases directories.
 * Since usecases now use direct dependency injection, the centralized dependency injection is no longer needed.
 *
 * It transforms files like:
 *
 * import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
 * import * as informationBannerRepository from '../../infrastructure/repositories/information-banner-repository.js';
 *
 * const dependencies = {
 *   informationBannerRepository,
 * };
 *
 * import { getInformationBanner } from './get-information-banner.js';
 *
 * const usecasesWithoutInjectedDependencies = {
 *   getInformationBanner,
 * };
 *
 * const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);
 * export { usecases };
 *
 * Into:
 *
 * import { getInformationBanner } from './get-information-banner.js';
 *
 * const usecases = {
 *   getInformationBanner,
 * };
 *
 * export { usecases };
 */

/**
 * Main transformation function
 */
function transform(source, api, options) {
  const j = api.jscodeshift;
  const root = j(source);
  const filePath = options.path || '';

  // Only process files that are in domain/usecases/index.js
  if (!filePath.includes('domain/usecases/index.js')) {
    console.log(`Skipping non-usecases index file: ${filePath}`);
    return source;
  }

  let hasChanges = false;

  // 1. Remove injectDependencies import
  root.find(j.ImportDeclaration).forEach((importPath) => {
    const node = importPath.node;
    if (node.source.value.includes('dependency-injection')) {
      j(importPath).remove();
      hasChanges = true;
    }
  });

  // 2. Remove dependency imports (repositories, services, validators, utils, config, etc.)
  // Keep only usecase imports (imports from local files starting with './')
  root.find(j.ImportDeclaration).forEach((importPath) => {
    const node = importPath.node;
    const importSource = node.source.value;

    // Keep only local usecase imports (files starting with './')
    if (importSource.startsWith('./')) {
      return; // Keep these imports
    }

    // Remove all other imports (dependencies, including infrastructure/repositories/index.js)
    j(importPath).remove();
    hasChanges = true;
  });

  // 3. Remove dependencies object declaration
  root.find(j.VariableDeclarator).forEach((declaratorPath) => {
    const node = declaratorPath.node;
    if (node.id && node.id.name === 'dependencies') {
      // Remove the entire variable declaration
      const variableDeclaration = declaratorPath.parent;
      j(variableDeclaration).remove();
      hasChanges = true;
    }
  });

  // 4. Rename usecasesWithoutInjectedDependencies to usecases and remove injectDependencies call
  root.find(j.VariableDeclarator).forEach((declaratorPath) => {
    const node = declaratorPath.node;
    if (node.id && node.id.name === 'usecasesWithoutInjectedDependencies') {
      // Rename the variable
      node.id.name = 'usecases';
      hasChanges = true;
    }
  });

  // 5. Remove the injectDependencies call (const usecases = injectDependencies(...))
  root.find(j.VariableDeclarator).forEach((declaratorPath) => {
    const node = declaratorPath.node;
    if (
      node.id &&
      node.id.name === 'usecases' &&
      node.init &&
      node.init.type === 'CallExpression' &&
      node.init.callee &&
      node.init.callee.name === 'injectDependencies'
    ) {
      // Remove this variable declaration entirely since we renamed usecasesWithoutInjectedDependencies to usecases
      const variableDeclaration = declaratorPath.parent;
      j(variableDeclaration).remove();
      hasChanges = true;
    }
  });

  // 6. Remove any remaining variable declarations that reference dependencies or injectDependencies
  root.find(j.VariableDeclarator).forEach((declaratorPath) => {
    const node = declaratorPath.node;
    if (
      node.init &&
      node.init.type === 'CallExpression' &&
      node.init.callee &&
      node.init.callee.name === 'injectDependencies'
    ) {
      const variableDeclaration = declaratorPath.parent;
      j(variableDeclaration).remove();
      hasChanges = true;
    }
  });

  // 7. Clean up any Object.assign calls that might be used for dependencies
  root.find(j.VariableDeclarator).forEach((declaratorPath) => {
    const node = declaratorPath.node;
    if (
      node.id &&
      node.id.name === 'dependencies' &&
      node.init &&
      node.init.type === 'CallExpression' &&
      node.init.callee &&
      node.init.callee.object &&
      node.init.callee.object.name === 'Object' &&
      node.init.callee.property &&
      node.init.callee.property.name === 'assign'
    ) {
      const variableDeclaration = declaratorPath.parent;
      j(variableDeclaration).remove();
      hasChanges = true;
    }
  });

  // 8. Remove other dependency-related variable declarations (repositories, services, validators, utils)
  const dependencyRelatedNames = ['repositories', 'services', 'validators', 'utils'];
  root.find(j.VariableDeclarator).forEach((declaratorPath) => {
    const node = declaratorPath.node;
    if (node.id && dependencyRelatedNames.includes(node.id.name)) {
      const variableDeclaration = declaratorPath.parent;
      j(variableDeclaration).remove();
      hasChanges = true;
    }
  });

  if (!hasChanges) {
    console.log(`No changes needed for: ${filePath}`);
    return source;
  }

  // 9. Clean up the generated source to remove dependency-related comments
  let transformedSource = root.toSource({ quote: 'single', trailingComma: true });

  // Remove all JSDoc comments - we're cleaning up the index files completely
  transformedSource = transformedSource.replace(/\/\*\*[\s\S]*?\*\/\s*\n?/g, '');

  return transformedSource;
}

module.exports = transform;
module.exports.parser = 'babylon';

// CLI execution
if (require.main === module) {
  const glob = require('glob');
  const yargs = require('yargs');

  const argv = yargs
    .option('pattern', {
      alias: 'p',
      describe: 'Glob pattern for files to transform',
      type: 'string',
      default: 'api/src/**/domain/usecases/index.js',
    })
    .option('dry-run', {
      alias: 'd',
      describe: 'Show what would be changed without actually changing files',
      type: 'boolean',
      default: false,
    })
    .help().argv;

  const files = glob.sync(argv.pattern);

  console.log(`Found ${files.length} files to process...`);

  files.forEach((filePath) => {
    try {
      const source = fs.readFileSync(filePath, 'utf8');
      const transformedSource = transform(source, { jscodeshift }, { path: filePath });

      if (source !== transformedSource) {
        console.log(`Transforming: ${filePath}`);

        if (!argv.dryRun) {
          fs.writeFileSync(filePath, transformedSource);
        } else {
          console.log('--- DRY RUN - Changes would be:');
          console.log(transformedSource);
          console.log('--- END DRY RUN ---\n');
        }
      } else {
        if (argv.dryRun) {
          console.log(`No changes needed for: ${filePath}`);
        }
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  });

  console.log('Transformation complete!');
}
