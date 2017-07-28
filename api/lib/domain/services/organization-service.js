const _ = require('lodash');

function _randomLetter() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXZ';
  return letters.charAt(_.random(0, 9));
}

function generateOrganizationCode() {

  let code = '';

  for(let i = 0; i < 4; i++) {
    code += _randomLetter();
  }

  code += _.random(0, 9) + '' + _.random(0, 9);

  return code;
}

module.exports = {
  generateOrganizationCode
};
