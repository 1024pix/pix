const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(organizationLearnerIdentity) {
    return new Serializer('schooling-registration-user-association', {
      attributes: ['lastName', 'firstName'],
    }).serialize(organizationLearnerIdentity);
  },
};
