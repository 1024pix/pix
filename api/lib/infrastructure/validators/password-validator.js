const XRegExp = require('xregexp');
const { passwordValidationPattern } = require('../../config').account;

module.exports = (password) => {
  if (!password) {
    return false;
  }
  const pattern = XRegExp(passwordValidationPattern);
  return pattern.test(password);
};
