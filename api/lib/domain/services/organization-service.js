const _ = require('lodash');

function _randomLetters(count) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXZ'.split('');
  return _.sampleSize(letters, count).join('');
}

function generateOrganizationCode() {

  let code = _randomLetters(4);
  code += _.random(0, 9) + '' + _.random(0, 9);

  return code;
}

module.exports = {
  generateOrganizationCode
};
