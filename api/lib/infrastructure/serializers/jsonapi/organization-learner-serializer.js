const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(organizationLearner) {
    return new Serializer('organization-learner', {
      attributes: ['lastName', 'firstName'],
    }).serialize(organizationLearner);
  },
};
