const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(passwordResetDemands) {
    return new Serializer('password-reset-demand', {
      attributes: ['email', 'temporaryKey']
    }).serialize(passwordResetDemands);
  }

};
