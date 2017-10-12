const JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = {
  serialize(passwordResets) {
    return new JSONAPISerializer('password-reset', {
      attributes: ['email', 'temporaryKey'],
      transform(passwordReset) {
        passwordReset.id = passwordReset.id.toString();
        return passwordReset;
      }
    }).serialize(passwordResets);
  }
};
