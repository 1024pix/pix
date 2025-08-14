const jscodeshift = require('jscodeshift');
const fs = require('node:fs');
const path = require('node:path');

/**
 * This codemod transforms usecase files to use direct dependency injection instead of
 * relying on the centralized dependency injection system from index.js files.
 *
 * It transforms functions like:
 *
 * const deleteUnassociatedBadge = async function ({ badgeId, badgeRepository }) {
 *   // logic
 * };
 *
 * Into:
 *
 * import * as injectedBadgeRepository from '../../infrastructure/repositories/badge-repository.js';
 *
 * const deleteUnassociatedBadge = async function ({
 *   badgeId,
 *   badgeRepository = injectedBadgeRepository
 * } = {}) {
 *   // logic
 * };
 */

/**
 * Calculates the relative path from source file to target file
 */
function calculateRelativePath(sourceFile, targetFile) {
  const sourceDirname = path.dirname(sourceFile);
  const relativePath = path.relative(sourceDirname, targetFile);

  // Ensure we use forward slashes and add .js extension if missing
  const normalizedPath = relativePath.replace(/\\/g, '/');
  return normalizedPath.endsWith('.js') ? normalizedPath : normalizedPath + '.js';
}

/**
 * Reads and parses a given index file to extract dependency mappings
 * Can be used recursively to resolve spread elements
 */
function extractDependenciesFromFile(filePath, visited = new Set()) {
  try {
    // Prevent infinite recursion
    if (visited.has(filePath)) {
      return {};
    }
    visited.add(filePath);

    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return {};
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fileAst = jscodeshift(fileContent);
    const dependencies = {};

    // Extract import statements and map them to dependency names with their import style
    fileAst.find(jscodeshift.ImportDeclaration).forEach((importPath) => {
      const node = importPath.node;
      if (node.specifiers && node.specifiers.length > 0) {
        node.specifiers.forEach((specifier) => {
          if (specifier.type === 'ImportNamespaceSpecifier') {
            // import * as name from 'module'
            const localName = specifier.local.name;
            const importSource = node.source.value;
            dependencies[localName] = {
              path: importSource,
              importType: 'namespace',
              originalName: specifier.imported ? specifier.imported.name : localName,
            };
          } else if (specifier.type === 'ImportSpecifier') {
            // import { name } from 'module' or import { originalName as localName } from 'module'
            const localName = specifier.local.name;
            const originalName = specifier.imported ? specifier.imported.name : localName;
            const importSource = node.source.value;
            dependencies[localName] = {
              path: importSource,
              importType: 'destructured',
              originalName: originalName,
            };
          } else if (specifier.type === 'ImportDefaultSpecifier') {
            // import name from 'module'
            const localName = specifier.local.name;
            const importSource = node.source.value;
            dependencies[localName] = {
              path: importSource,
              importType: 'default',
              originalName: localName,
            };
          }
        });
      }
    });

    // Helper function to process object properties (reused for different object declarations)
    function processObjectProperties(properties, dependencies, currentFilePath, visited) {
      properties.forEach((prop) => {
        if (prop.type === 'Property' && prop.key.type === 'Identifier') {
          const depName = prop.key.name;
          if (prop.shorthand) {
            // Shorthand property: { badgeRepository } -> badgeRepository: badgeRepository
            if (dependencies[depName]) {
              // Keep the same mapping since key === value in shorthand
              // dependencies[depName] already exists from import
            }
          } else if (prop.value.type === 'Identifier') {
            // Regular property: { badgeRepository: someVariable }
            if (dependencies[prop.value.name]) {
              dependencies[depName] = dependencies[prop.value.name];
            }
          } else if (prop.value.type === 'MemberExpression') {
            // Member expression: { organizationForAdminRepository: organizationalEntitiesRepositories.organizationForAdminRepository }
            const objectName = prop.value.object.name;
            const propertyName = prop.value.property.name;

            // Look for the import of the object (e.g., organizationalEntitiesRepositories)
            if (dependencies[objectName]) {
              // Create a new dependency entry for this member access
              const baseDependency = dependencies[objectName];
              dependencies[depName] = {
                path: baseDependency.path,
                importType: baseDependency.importType,
                originalName: baseDependency.originalName,
                localName: objectName, // Store the local name used (organizationalEntitiesRepositories)
                memberProperty: propertyName, // Add the property name for member access
              };
            }
          }
        } else if (prop.type === 'SpreadElement' && prop.argument.type === 'Identifier') {
          // Spread element: { ...enrolmentRepositories }
          const spreadObjectName = prop.argument.name;

          if (dependencies[spreadObjectName]) {
            // Resolve the spread element by reading the target file
            const baseDependency = dependencies[spreadObjectName];
            const targetFilePath = path.resolve(path.dirname(currentFilePath), baseDependency.path);

            // Recursively extract dependencies from the target file
            const spreadDependencies = extractDependenciesFromFile(targetFilePath, visited);

            // Add all spread dependencies to our main dependencies object
            Object.keys(spreadDependencies).forEach((key) => {
              if (!dependencies[key]) {
                // Don't overwrite existing dependencies
                // Adjust the path to be relative to the current file, not the spread target file
                const adjustedDependency = { ...spreadDependencies[key] };

                // Calculate the relative path from current file to the spread dependency
                const spreadDependencyPath = path.resolve(path.dirname(targetFilePath), adjustedDependency.path);
                const adjustedPath = path.relative(path.dirname(currentFilePath), spreadDependencyPath);

                // Ensure we use forward slashes and add .js extension if missing
                const normalizedPath = adjustedPath.replace(/\\/g, '/');
                adjustedDependency.path = normalizedPath.endsWith('.js') ? normalizedPath : normalizedPath + '.js';

                dependencies[key] = adjustedDependency;
              }
            });
          }
        }
      });
    }

    // Look for direct dependencies object declaration
    fileAst
      .find(jscodeshift.VariableDeclarator, {
        id: { name: 'dependencies' },
      })
      .forEach((declaratorPath) => {
        const properties = declaratorPath.node.init?.properties || [];
        processObjectProperties(properties, dependencies, filePath, visited);
      });

    // Look for repositories, services, etc. objects that might be used in Object.assign
    const objectNames = ['repositories', 'services', 'validators', 'utils', 'repositoriesWithoutInjectedDependencies'];
    objectNames.forEach((objectName) => {
      fileAst
        .find(jscodeshift.VariableDeclarator, {
          id: { name: objectName },
        })
        .forEach((declaratorPath) => {
          const properties = declaratorPath.node.init?.properties || [];
          processObjectProperties(properties, dependencies, filePath, visited);
        });
    });

    // Look for objects created with injectDependencies() and extract from their source objects
    // Pattern: const finalObject = injectDependencies(sourceObject, deps);
    fileAst.find(jscodeshift.VariableDeclarator).forEach((declaratorPath) => {
      const node = declaratorPath.node;
      if (
        node.init &&
        node.init.type === 'CallExpression' &&
        node.init.callee &&
        node.init.callee.name === 'injectDependencies' &&
        node.init.arguments.length >= 1
      ) {
        // Get the first argument (the source object)
        const sourceArg = node.init.arguments[0];

        if (sourceArg.type === 'Identifier') {
          // The source is a variable reference, find its declaration
          const sourceName = sourceArg.name;

          fileAst
            .find(jscodeshift.VariableDeclarator, {
              id: { name: sourceName },
            })
            .forEach((sourceDeclaratorPath) => {
              const sourceProperties = sourceDeclaratorPath.node.init?.properties || [];
              processObjectProperties(sourceProperties, dependencies, filePath, visited);
            });
        } else if (sourceArg.type === 'ObjectExpression') {
          // The source is an inline object
          const sourceProperties = sourceArg.properties || [];
          processObjectProperties(sourceProperties, dependencies, filePath, visited);
        }
      }
    });

    return dependencies;
  } catch (error) {
    console.warn(`Error reading file ${filePath}:`, error.message);
    return {};
  }
}

/**
 * Reads and parses the corresponding index.js file to extract dependency mappings
 */
function extractDependenciesFromIndexFile(usecaseFilePath) {
  try {
    const usecaseDir = path.dirname(usecaseFilePath);
    const indexFilePath = path.join(usecaseDir, 'index.js');

    return extractDependenciesFromFile(indexFilePath);
  } catch (error) {
    console.warn(`Error reading index file for ${usecaseFilePath}:`, error.message);
    return {};
  }
}

/**
 * Capitalizes the first letter of a string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Main transformation function
 */
function transform(source, api, options) {
  const j = api.jscodeshift;
  const root = j(source);
  const filePath = options.path || '';

  // Extract dependencies from the corresponding index.js file
  const dependencies = extractDependenciesFromIndexFile(filePath);

  if (Object.keys(dependencies).length === 0) {
    console.warn(`No dependencies found for ${filePath}`);
    return source;
  }

  const importsToAdd = new Set();
  const usedDependencies = new Set();

  // Get all exported identifiers to know which functions to transform
  const exportedIdentifiers = new Set();

  // Find named exports: export { functionName }
  root.find(jscodeshift.ExportNamedDeclaration).forEach((exportPath) => {
    const node = exportPath.node;
    if (node.specifiers) {
      node.specifiers.forEach((specifier) => {
        if (specifier.type === 'ExportSpecifier' && specifier.exported) {
          exportedIdentifiers.add(specifier.exported.name);
        }
      });
    }

    // Handle direct export declarations: export const functionName = ...
    if (node.declaration) {
      if (node.declaration.type === 'VariableDeclaration') {
        node.declaration.declarations.forEach((declarator) => {
          if (declarator.id && declarator.id.name) {
            exportedIdentifiers.add(declarator.id.name);
          }
        });
      } else if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id) {
        exportedIdentifiers.add(node.declaration.id.name);
      }
    }
  });

  // Find default exports: export default functionName
  root.find(jscodeshift.ExportDefaultDeclaration).forEach((exportPath) => {
    const node = exportPath.node;
    if (node.declaration && node.declaration.type === 'Identifier') {
      exportedIdentifiers.add(node.declaration.name);
    }
  });

  // Function to check if a function should be transformed based on exports
  function shouldTransformFunction(funcPath) {
    const func = funcPath.node;

    // Check if it's a function declaration
    if (func.type === 'FunctionDeclaration' && func.id) {
      return exportedIdentifiers.has(func.id.name);
    }

    // Check if it's a variable declaration with a function expression/arrow function
    const parent = funcPath.parent;
    if (parent && parent.node) {
      // Case: const functionName = function() {} or const functionName = () => {}
      if (parent.node.type === 'VariableDeclarator' && parent.node.id && parent.node.id.name) {
        return exportedIdentifiers.has(parent.node.id.name);
      }

      // Case: const functionName = withTransaction(function() {})
      if (parent.node.type === 'CallExpression') {
        const grandParent = funcPath.parent.parent;
        if (
          grandParent &&
          grandParent.node &&
          grandParent.node.type === 'VariableDeclarator' &&
          grandParent.node.id &&
          grandParent.node.id.name
        ) {
          return exportedIdentifiers.has(grandParent.node.id.name);
        }
      }

      // Case: assignment expression: functionName = function() {}
      if (parent.node.type === 'AssignmentExpression' && parent.node.left && parent.node.left.type === 'Identifier') {
        return exportedIdentifiers.has(parent.node.left.name);
      }
    }

    return false;
  }

  // Find all function declarations and expressions that might be usecases
  const functionTypes = [
    jscodeshift.FunctionDeclaration,
    jscodeshift.FunctionExpression,
    jscodeshift.ArrowFunctionExpression,
  ];

  functionTypes.forEach((funcType) => {
    root.find(funcType).forEach((funcPath) => {
      const func = funcPath.node;

      // Only transform functions that are exported
      if (!shouldTransformFunction(funcPath)) return;

      // Skip functions without parameters or with non-destructuring parameters
      if (!func.params || func.params.length === 0) return;

      let firstParam = func.params[0];

      // Handle AssignmentPattern (e.g., { params } = {})
      if (firstParam.type === 'AssignmentPattern') {
        firstParam = firstParam.left;
      }

      if (firstParam.type !== 'ObjectPattern') return;

      // Analyze destructuring properties to find dependency parameters
      const properties = firstParam.properties || [];
      let hasUsedDependencies = false;

      properties.forEach((prop) => {
        if (prop.type === 'Property' && prop.key.type === 'Identifier') {
          const paramName = prop.key.name;

          // Check if this parameter matches a known dependency
          if (dependencies[paramName]) {
            const depInfo = dependencies[paramName];
            const relativePath = calculateRelativePath(filePath, path.resolve(path.dirname(filePath), depInfo.path));

            // Generate import statement and default value based on original import type
            let importStatement;
            let injectedName;

            if (depInfo.memberProperty) {
              // Handle member expressions: use the original object name for the import
              // organizationalEntitiesRepositories.organizationForAdminRepository
              injectedName = `injected${capitalize(depInfo.originalName)}`;

              if (depInfo.importType === 'destructured') {
                importStatement = `import { ${depInfo.originalName} as ${injectedName} } from '${relativePath}';`;
              } else {
                // For namespace imports, we still import the whole object
                importStatement = `import * as ${injectedName} from '${relativePath}';`;
              }
            } else {
              // Handle regular imports
              injectedName = `injected${capitalize(paramName)}`;

              if (depInfo.importType === 'namespace') {
                importStatement = `import * as ${injectedName} from '${relativePath}';`;
              } else if (depInfo.importType === 'destructured') {
                importStatement = `import { ${depInfo.originalName} as ${injectedName} } from '${relativePath}';`;
              } else if (depInfo.importType === 'default') {
                importStatement = `import ${injectedName} from '${relativePath}';`;
              }
            }

            // Check if this import already exists in the file
            let importAlreadyExists = false;
            let existingImportName = null;

            root.find(jscodeshift.ImportDeclaration).forEach((importPath) => {
              const importNode = importPath.node;
              if (importNode.source.value === relativePath) {
                // Check if we have a matching specifier
                importNode.specifiers.forEach((spec) => {
                  if (depInfo.memberProperty) {
                    // For member expressions, we need the same import type and original name
                    if (depInfo.importType === 'destructured' && spec.type === 'ImportSpecifier') {
                      if (spec.imported && spec.imported.name === depInfo.originalName) {
                        importAlreadyExists = true;
                        existingImportName = spec.local.name;
                      }
                    } else if (depInfo.importType === 'namespace' && spec.type === 'ImportNamespaceSpecifier') {
                      importAlreadyExists = true;
                      existingImportName = spec.local.name;
                    }
                  } else {
                    // For regular imports, check if the injected name matches
                    if (depInfo.importType === 'namespace' && spec.type === 'ImportNamespaceSpecifier') {
                      if (spec.local.name === injectedName) {
                        importAlreadyExists = true;
                        existingImportName = spec.local.name;
                      }
                    } else if (depInfo.importType === 'destructured' && spec.type === 'ImportSpecifier') {
                      if (spec.local.name === injectedName) {
                        importAlreadyExists = true;
                        existingImportName = spec.local.name;
                      }
                    } else if (depInfo.importType === 'default' && spec.type === 'ImportDefaultSpecifier') {
                      if (spec.local.name === injectedName) {
                        importAlreadyExists = true;
                        existingImportName = spec.local.name;
                      }
                    }
                  }
                });
              }
            });

            if (!importAlreadyExists) {
              importsToAdd.add(importStatement);
            } else if (depInfo.memberProperty && existingImportName) {
              // Update injectedName to use existing import
              injectedName = existingImportName;
            }

            usedDependencies.add(paramName);
            hasUsedDependencies = true;

            // Transform the property to have a default value
            if (prop.value && prop.value.type === 'Identifier' && prop.value.name === paramName) {
              // Simple property shorthand: { badgeRepository }
              if (depInfo.memberProperty) {
                // Create a member expression for the default value
                prop.value = j.assignmentPattern(
                  j.identifier(paramName),
                  j.memberExpression(j.identifier(injectedName), j.identifier(depInfo.memberProperty)),
                );
              } else {
                prop.value = j.assignmentPattern(j.identifier(paramName), j.identifier(injectedName));
              }
            } else if (!prop.value) {
              // Property shorthand: { badgeRepository } (no explicit value)
              if (depInfo.memberProperty) {
                // Create a member expression for the default value
                prop.value = j.assignmentPattern(
                  j.identifier(paramName),
                  j.memberExpression(j.identifier(injectedName), j.identifier(depInfo.memberProperty)),
                );
              } else {
                prop.value = j.assignmentPattern(j.identifier(paramName), j.identifier(injectedName));
              }
            }
          }
        }
      });

      // If we found dependencies, ensure the function parameter has a default empty object
      if (hasUsedDependencies) {
        if (firstParam.type === 'ObjectPattern' && func.params.length === 1) {
          func.params[0] = j.assignmentPattern(firstParam, j.objectExpression([]));
        }
      }
    });
  });

  // Add imports at the beginning of the file
  if (importsToAdd.size > 0) {
    const existingImports = root.find(jscodeshift.ImportDeclaration);
    const importStatements = Array.from(importsToAdd)
      .map((importStr) => {
        try {
          const importAst = j(importStr);
          return importAst.find(jscodeshift.ImportDeclaration).at(0).get().node;
        } catch (error) {
          console.warn(`Error parsing import statement: ${importStr}`, error.message);
          return null;
        }
      })
      .filter(Boolean);

    if (existingImports.length > 0) {
      // Add after the last existing import
      const lastImport = existingImports.at(-1);
      importStatements.forEach((importNode) => {
        lastImport.insertAfter(importNode);
      });
    } else {
      // Add at the beginning of the file
      const program = root.find(j.Program);
      if (program.length > 0) {
        const body = program.get('body');
        // Find the first non-import statement to insert before it
        const firstNonImport = body.value.find((node) => node.type !== 'ImportDeclaration');
        if (firstNonImport) {
          const insertIndex = body.value.indexOf(firstNonImport);
          // Insert imports in reverse order to maintain correct order
          importStatements.reverse().forEach((importNode) => {
            body.value.splice(insertIndex, 0, importNode);
          });
        } else {
          // File has only imports, add at the end
          importStatements.forEach((importNode) => {
            body.value.push(importNode);
          });
        }
      }
    }
  }

  const sourceCode = root.toSource({
    quote: 'single',
    trailingComma: true,
  });

  // Fix formatting issues with imports appearing on the same line
  return sourceCode
    .replace(/;(import\s)/g, ';\n$1')
    .replace(/;(const\s)/g, ';\n\n$1')
    .replace(/;(export\s)/g, ';\n\n$1');
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
      default: 'api/src/**/domain/usecases/*.js',
    })
    .option('dry-run', {
      alias: 'd',
      describe: 'Show what would be changed without actually changing files',
      type: 'boolean',
      default: false,
    })
    .option('exclude-index', {
      alias: 'e',
      describe: 'Exclude index.js files from transformation',
      type: 'boolean',
      default: true,
    })
    .help().argv;

  const files = glob.sync(argv.pattern, { ignore: argv.excludeIndex ? '**/index.js' : undefined });

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
