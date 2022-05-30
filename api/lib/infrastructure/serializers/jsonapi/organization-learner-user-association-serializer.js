const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(schoolingRegistrationUserAssociation) {
    return new Serializer('schooling-registration-user-association', {
      attributes: ['lastName', 'firstName', 'birthdate', 'campaignCode'],
    }).serialize(schoolingRegistrationUserAssociation);
  },
};
