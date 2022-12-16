const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(newEmail) {
    return new Serializer('email-verification-codes', {
      attributes: ['email'],
    }).serialize(newEmail);
  },
};
