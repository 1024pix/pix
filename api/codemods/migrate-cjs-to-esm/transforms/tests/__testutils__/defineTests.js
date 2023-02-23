const { defineTest } = require('jscodeshift/dist/testUtils');
const fs = require('fs');
const path = require('path');

module.exports = {
  defineTests(dirName, transformName) {
    const inputFileSuffixRegex = /\.input\.js$/i;
    const testFileNames = fs
      .readdirSync(path.resolve(dirName, '../__testfixtures__', transformName))
      .filter((fileName) => inputFileSuffixRegex.test(fileName))
      .map((fileName) => fileName.replace(inputFileSuffixRegex, ''));

    const transformPath = `../src/${transformName}`;

    testFileNames.forEach((testFileName) => {
      defineTest(
        dirName,
        transformPath,
        {
          silent: true,
        },
        `${transformName}/${testFileName}`
      );
    });
  },
};
