const XRegExp = require('xregexp');

module.exports = (password) => {
  if (!password) {
    return false;
  }
  const pattern = XRegExp('^(?=.*\\p{L})(?=.*\\d).{8,}$');
  return pattern.test(password);
};
