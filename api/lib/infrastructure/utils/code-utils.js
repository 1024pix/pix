const randomString = require('randomstring');

module.exports = {
  generateNumericalString(numberOfDigits) {
    return randomString.generate({
      charset: 'numeric',
      length: numberOfDigits,
      readable: true,
    });
  },

  generateStringCodeForOrganizationInvitation() {
    return randomString.generate({
      length: 10,
      capitalization: 'uppercase',
    });
  },
};
