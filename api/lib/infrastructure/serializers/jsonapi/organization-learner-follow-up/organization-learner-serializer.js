const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(organizationLearner) {
    return new Serializer('organization-learner', {
      attributes: [
        'lastName',
        'firstName',
        'email',
        'username',
        'authenticationMethods',
        'division',
        'group',
        'isCertifiable',
        'certifiableAt',
      ],
    }).serialize(organizationLearner);
  },
};
