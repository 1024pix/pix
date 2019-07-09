const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(passwordResetDemand) {
    return new Serializer('password-reset-demand', {
      attributes: ['email', 'temporaryKey']
    }).serialize(passwordResetDemand);
  },

};
