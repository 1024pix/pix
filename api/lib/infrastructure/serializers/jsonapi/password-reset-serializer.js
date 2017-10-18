const JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = {
  serialize(passwordResetDemands) {
    return new JSONAPISerializer('password-reset-demand', {
      attributes: ['email', 'temporaryKey'],
      transform(passwordResetDemand) {
        passwordResetDemand.id = passwordResetDemand.id.toString();
        return passwordResetDemand;
      }
    }).serialize(passwordResetDemands);
  }
};
