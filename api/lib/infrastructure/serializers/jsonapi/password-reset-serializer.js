const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(passwordReset) {
    return new Serializer('password-reset', {
      attributes: ['password', 'temporaryKey']
    }).serialize(passwordReset);
  },

};
