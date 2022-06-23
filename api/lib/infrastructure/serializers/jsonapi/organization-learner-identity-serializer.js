const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(organizationLearnerIdentity) {
    return new Serializer('organization-learner', {
      attributes: ['lastName', 'firstName'],
    }).serialize(organizationLearnerIdentity);
  },
};
