const XRegExp = require('xregexp');
const { passwordValidationPattern } = require('../../settings');

module.exports = (password) => {
  if (!password) {
    return false;
  }
  const pattern = XRegExp(passwordValidationPattern);
  return pattern.test(password);
};
