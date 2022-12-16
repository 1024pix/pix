const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(organizationLearnerIdentity) {
    return new Serializer('organization-learner-identity', {
      attributes: ['lastName', 'firstName'],
    }).serialize(organizationLearnerIdentity);
  },
};
