const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(schoolingRegistrationDependentUser) {
    return new Serializer('schooling-registration-dependent-user', {
      attributes: ['username', 'generatedPassword'],
    }).serialize(schoolingRegistrationDependentUser);
  },
};
