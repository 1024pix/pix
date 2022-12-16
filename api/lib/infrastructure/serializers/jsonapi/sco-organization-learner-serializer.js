const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serializeIdentity(scoOrganizationLearner) {
    return new Serializer('sco-organization-learner', {
      attributes: ['lastName', 'firstName', 'birthdate'],
    }).serialize(scoOrganizationLearner);
  },

  serializeWithUsernameGeneration(scoOrganizationLearner) {
    return new Serializer('sco-organization-learner', {
      attributes: ['lastName', 'firstName', 'birthdate', 'username'],
    }).serialize(scoOrganizationLearner);
  },

  serializeExternal(scoOrganizationLearner) {
    return new Serializer('external-users', {
      attributes: ['accessToken'],
    }).serialize(scoOrganizationLearner);
  },

  serializeCredentialsForDependent(scoOrganizationLearner) {
    return new Serializer('dependent-users', {
      attributes: ['username', 'generatedPassword'],
    }).serialize(scoOrganizationLearner);
  },
};
