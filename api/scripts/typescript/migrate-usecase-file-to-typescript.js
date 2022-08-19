#!/usr/bin/env node
'use strict';

require('dotenv').config();
const fs = require('fs');
const { isGeneratorFunction } = require('util/types');
const { access, readFile, writeFile, rename } = require('fs').promises;
const { NotFoundError } = require('../../lib/domain/errors');

async function _readFile({ filePath }) {
  try {
    await access(filePath, fs.constants.F_OK);
  } catch (err) {
    throw new NotFoundError(`File ${filePath} not found!`);
  }

  return await readFile(filePath, 'utf8');
}

function _insertAt(array, index, ...elementsArray) {
  return array.splice(index, 0, ...elementsArray);
}

function _getUsecaseNameInCamelCaseWithUppercase({ filePath }) {
  const filePathModified = filePath
    .replace(/.*\//, '')
    .replace(/-./g, (letter) => letter[1].toUpperCase())
    .replace('.js', '')
    .replace('.ts', '');
  return filePathModified[0].toUpperCase() + filePathModified.slice(1);
}

function _transformToKebabCase(string) {
  const re = /[\W_]+|(?<=[a-z0-9])(?=[A-Z])/g;
  return string.replace(re, '-').toLowerCase();
}

function _getRepositoryNames({ fileContent }) {
  const matchingRepositoryNames = [];
  fileContent.forEach((line, index) => {
    const isLineModuleExport = /module\.exports = /.test(line);
    if (isLineModuleExport) {
      const moduleExportLine = line;

      const repositoryNameRegex = /[a-zA-Z]+Repository/;
      const endOfFunctionSignature = /}\) {/;
      const repositoryNamesOnModuleExportLine = moduleExportLine.match(repositoryNameRegex);
      if (repositoryNamesOnModuleExportLine) {
        matchingRepositoryNames.push(...repositoryNamesOnModuleExportLine);
      }

      const isFunctionSignatureWrittenInMoreThanOneLine = /\({$/.test(line);
      if (isFunctionSignatureWrittenInMoreThanOneLine) {
        let indexOfNextLine = index + 1;
        let nextLine = fileContent[indexOfNextLine];
        let isNextLineTheEndOfFunctionSignature = endOfFunctionSignature.test(nextLine);
        while (!isNextLineTheEndOfFunctionSignature) {
          if (repositoryNameRegex.test(nextLine)) {
            matchingRepositoryNames.push(nextLine.replace(',', '').trim());
          }

          indexOfNextLine += 1;
          nextLine = fileContent[indexOfNextLine];
          isNextLineTheEndOfFunctionSignature = endOfFunctionSignature.test(nextLine);
        }
      }
    }
  });
  return matchingRepositoryNames;
}

function _getParametersNames({ fileContent }) {
  const matchingParametersNames = [];
  fileContent.forEach((line, index) => {
    const isLineUsecaseSignature = /module\.exports = /.test(line);
    if (isLineUsecaseSignature) {
      const moduleExportLine = line;

      const allParametersInString = moduleExportLine.match(/\({ .* }\)/g)?.toString();
      if (allParametersInString) {
        const allParameters = allParametersInString.replace('({', '').replace('})', '').trim().split(',');
        const parametersWithoutRepositories = allParameters.filter((parameter) => {
          const parameterIsARepository = /Repository/.test(parameter);
          return !parameterIsARepository;
        });
        if (parametersWithoutRepositories) {
          matchingParametersNames.push(...parametersWithoutRepositories);
        }
      }

      const endOfFunctionSignature = /}\) {/;
      const isFunctionSignatureWrittenInMoreThanOneLine = /\({$/.test(line);
      if (isFunctionSignatureWrittenInMoreThanOneLine) {
        let indexOfNextLine = index + 1;
        let nextLine = fileContent[indexOfNextLine];
        let isNextLineTheEndOfFunctionSignature = endOfFunctionSignature.test(nextLine);
        while (!isNextLineTheEndOfFunctionSignature) {
          const isLineARepository = /Repository/.test(nextLine);
          const isLineAParameter = /[a-zA-Z]+/.test(nextLine);
          if (!isLineARepository && isLineAParameter) {
            matchingParametersNames.push(nextLine.replace(',', '').trim());
          }

          indexOfNextLine += 1;
          nextLine = fileContent[indexOfNextLine];
          isNextLineTheEndOfFunctionSignature = endOfFunctionSignature.test(nextLine);
        }
      }
    }
  });
  return matchingParametersNames;
}

function _transformRepositoryNameIntoInterfaceName(repositoryName) {
  return repositoryName[0].toUpperCase() + repositoryName.slice(1) + 'Interface';
}

function _insertRepositoryInterfacesImport({ fileContent, repositoryNames }) {
  const repositoyInterfacesImports = repositoryNames.map((repositoryName) => {
    return (
      `import { ${_transformRepositoryNameIntoInterfaceName(repositoryName)} } from ` +
      `'../../infrastructure/repositories/${_transformToKebabCase(repositoryName)}';`
    );
  });
  repositoyInterfacesImports[repositoyInterfacesImports.length - 1] += '\n';
  _insertAt(fileContent, 0, ...repositoyInterfacesImports);
  return fileContent;
}

function _transformRequireToImport({ fileContent }) {
  return fileContent.map((line) => {
    const isLineARequire = /= require\(/.test(line);
    if (isLineARequire) {
      const newImportLine = line
        .replace('const {', 'import {') // transform import with {} destructuration
        .replace('} = require(', '} from ')
        .replace('const', 'import {') // transform import without {} destructuration
        .replace(' = require(', ' } from ')
        .replace(')', '');
      return newImportLine;
    } else {
      return line;
    }
  });
}

function _transformModuleExportIntoClass({ fileContent, usecaseName, repositoryNames, usecaseParametersNames }) {
  const repositoriesInjection = repositoryNames
    .map(
      (repositoryName) =>
        `private readonly ${repositoryName}: ${_transformRepositoryNameIntoInterfaceName(repositoryName)}`
    )
    .join(',');
  const parametersList = usecaseParametersNames.join(': ?, ') + ': ?';
  const beginningOfTheClass = [
    `export class ${usecaseName} {`,
    `\tconstructor(${repositoriesInjection}) {}\n`,
    `\texecute(${parametersList}): Promise<?> {`,
  ];

  let newFileContent = [];

  const _replaceModuleExportByClass = ({ fileContent, beginningOfTheClass }) => {
    let isLineTheUsecaseFunctionSignature = false;
    let isBeginningOfTheClassInserted = false;
    fileContent.forEach((line) => {
      const isLineModuleExport = /module\.exports = /.test(line);
      const shouldChangeThisLine = isLineModuleExport || isLineTheUsecaseFunctionSignature;
      if (shouldChangeThisLine) {
        isLineTheUsecaseFunctionSignature = true;
        const isLineTheEndOfFunctionSignature = /}\)/.test(line);
        if (isLineTheEndOfFunctionSignature) {
          isLineTheUsecaseFunctionSignature = false;
          isBeginningOfTheClassInserted = true;
          newFileContent.push(...beginningOfTheClass);
        }
      } else {
        if(isBeginningOfTheClassInserted) {
          const isLineContainingRepository = /Repository/.test(line);
          if(isLineContainingRepository) {
            const isLineJsonParameters = /Repository,/.test(line);
            if(isLineJsonParameters) {
              line = line.replace(/([a-zA-Z]+Repository)/, '$1: this.$1');
            } else {
              line = line.replace(/([a-zA-Z]+Repository)/, 'this.$1');
            }
          }
        }
        newFileContent.push(line);
      }
    });
  };
  const _removeSemiColons = ({ fileContent }) => {
    return fileContent.map((line) => {
      return line.replace('};', '}');
    })
  };

  _replaceModuleExportByClass({ fileContent, beginningOfTheClass });
  newFileContent = _removeSemiColons({ fileContent: newFileContent });
  newFileContent.push('}');

  return newFileContent;
}

function _convertFileContentToString(fileContentWithInterface) {
  return fileContentWithInterface.join('\n');
}

async function _getNewFileContent({ filePath, currentFileContent }) {
  const fileContentArray = currentFileContent.split('\n');

  const usecaseName = _getUsecaseNameInCamelCaseWithUppercase({ filePath });
  const repositoryNames = _getRepositoryNames({ fileContent: fileContentArray });
  const usecaseParametersNames = _getParametersNames({ fileContent: fileContentArray });

  const newFileContentWithInterfacesImport = _insertRepositoryInterfacesImport({
    fileContent: fileContentArray,
    repositoryNames,
  });
  const newFileContentWithImports = _transformRequireToImport({ fileContent: newFileContentWithInterfacesImport });
  const newFileContentWithImportsAndExports = _transformModuleExportIntoClass({
    fileContent: newFileContentWithImports,
    usecaseName,
    repositoryNames,
    usecaseParametersNames,
  });

  return _convertFileContentToString(newFileContentWithImportsAndExports);
}

async function _writeNewFileContent({ filePath, newFileContent }) {
  try {
    await writeFile(filePath, newFileContent);
  } catch (err) {
    console.log(err);
  }
}

async function _renameJsFileToTs({ filePath }) {
  try {
    await rename(filePath, filePath.replace('.js', '.ts'));
  } catch (err) {
    console.log(err);
  }
}

async function main() {
  console.log('Starting magic script to transform usecase file into sexy usecase file');

  try {
    const filePath = process.argv[2];

    console.log('Reading file... ');
    const currentFileContent = await _readFile({ filePath });
    console.log('Constructing new file... ');
    const newFileContent = await _getNewFileContent({ filePath, currentFileContent });
    console.log('Saving new file content...');
    await _writeNewFileContent({ filePath, newFileContent });
    console.log('Renaming file js to ts...');
    await _renameJsFileToTs({ filePath });

    console.log('\nDone.');
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}
