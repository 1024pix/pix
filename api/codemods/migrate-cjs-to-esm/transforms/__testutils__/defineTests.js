const { defineTest } = require('jscodeshift/dist/testUtils');
const fs = require('fs');
const path = require('path');

module.exports = {
  defineTests: function (dirName, transformName) {
    const inputFileSuffixRegex = /\.input\.js$/i;
    const tests = fs
      .readdirSync(path.resolve(dirName, '../__testfixtures__', transformName))
      .filter((fileName) => inputFileSuffixRegex.test(fileName))
      .map((fileName) => fileName.replace(inputFileSuffixRegex, ''));

    tests.forEach((test) => {
      defineTest(
        dirName,
        transformName,
        {
          silent: true,
        },
        `${transformName}/${test}`
      );
    });
  },
};
