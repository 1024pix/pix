#!/usr/bin/env node
'use strict';

require('dotenv').config();
const fs = require('fs');
const { access, readFile, writeFile } = require('fs').promises;
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

function _getRepositoryNameInCamelCaseWithUppercase({ filePath }) {
  const filePathModified = filePath
    .replace(/.*\//, '')
    .replace(/-./g, (letter) => letter[1].toUpperCase())
    .replace('.js', '')
    .replace('.ts', '');
  return filePathModified[0].toUpperCase() + filePathModified.slice(1);
}

function _insertInterface({ fileContent, repositoryName }) {
  const _getInterfaceToInsertInString = ({ fileContentArray }) => {
    const repositoryFunctionsSignatures = [];
    fileContentArray.forEach((line, index) => {
      if (isMethodStart(line)) {
        repositoryFunctionsSignatures.push(getSignatureName(line, fileContentArray, index));
      }
    });

    return `export interface ${repositoryName}Interface {\n\t` + repositoryFunctionsSignatures.join('\n\t') + '\n}\n';
  };

  const fileContentArray = fileContent.split('\n');
  const interfaceToInsert = _getInterfaceToInsertInString({ fileContentArray });
  const lineNumberOfModuleExport = fileContentArray.indexOf('module.exports = {');
  _insertAt(fileContentArray, lineNumberOfModuleExport, interfaceToInsert);
  return fileContentArray;
}

function isMethodStart(line) {
  return line.includes('async');
}

function getSignatureName(line, fileContentArray, index) {
  let resultLine = line;
  if (!isACompleteMethodSignature(resultLine)) {
    for (let i = index + 1; i < fileContentArray.length; i++) {
      resultLine = resultLine + ' ' + fileContentArray[i];
      if (isACompleteMethodSignature(resultLine)) {
        break;
      }
    }
    resultLine = resultLine.replaceAll(/ /g, '');
  }
  resultLine = resultLine.replace('async', '').trim().replace(/{$/, ': Promise<?>;');
  if (!resultLine.includes('()')) {
    resultLine = resultLine.replaceAll(/,/g, ': ?,').replace(/\)/, ': ?)');
  }
  return resultLine;
}

function isACompleteMethodSignature(line) {
  return /^[ \t]{2}(async )[a-z]+(.*){$/.test(line);
}

function _transformRepositoryToAClass({ fileContent, repositoryName }) {
  const indexOfModuleExport = fileContent.indexOf('module.exports = {');
  fileContent[indexOfModuleExport] = `export class ${repositoryName} implements ${repositoryName}Interface {`;
  fileContent.push(`\nexport const ${repositoryName} = new ${repositoryName}();`);
  return fileContent;
}

function _convertFileContentToString(fileContentWithInterface) {
  return fileContentWithInterface.join('\n');
}

async function _getNewFileContent({ filePath, currentfileContent }) {
  const repositoryName = _getRepositoryNameInCamelCaseWithUppercase({ filePath });
  const fileContentWithInterface = _insertInterface({ fileContent: currentfileContent, repositoryName });
  const fileContentWithInterfaceAndClass = _transformRepositoryToAClass({
    fileContent: fileContentWithInterface,
    repositoryName,
  });

  const result = _convertFileContentToString(fileContentWithInterfaceAndClass);
  return result;
}

async function _writeNewFileContent({ filePath, newFileContent }) {
  try {
    await writeFile(filePath, newFileContent);
  } catch (err) {
    console.log(err);
  }
}

async function main() {
  console.log('Starting magic script to transform repository file into sexy repository file');

  try {
    const filePath = process.argv[2];

    console.log('Reading file... ');
    const currentfileContent = await _readFile({ filePath });
    console.log('Constructing new file... ');
    const newFileContent = await _getNewFileContent({ filePath, currentfileContent });
    console.log('Saving new file content...');
    await _writeNewFileContent({ filePath, newFileContent });

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
