const randomString = require('randomstring');

module.exports = {
  generateNumericalString(numberOfDigits) {
    return randomString.generate({
      charset: 'numeric',
      length: numberOfDigits,
      readable: true,
    });
  },
};
