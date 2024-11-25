import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serializeIdentity = function (scoOrganizationLearner) {
  return new Serializer('sco-organization-learner', {
    attributes: ['lastName', 'firstName', 'birthdate'],
  }).serialize(scoOrganizationLearner);
};

const serializeWithUsernameGeneration = function (scoOrganizationLearner) {
  return new Serializer('sco-organization-learner', {
    attributes: ['lastName', 'firstName', 'birthdate', 'username'],
    transform(scoOrganizationLearner) {
      return {
        ...scoOrganizationLearner,
        id: scoOrganizationLearner.username,
      };
    },
  }).serialize(scoOrganizationLearner);
};

const serializeExternal = function (scoOrganizationLearner) {
  return new Serializer('external-users', {
    transform(externalUser) {
      return {
        ...externalUser,
        id: externalUser.accessToken,
      };
    },
    attributes: ['accessToken'],
  }).serialize(scoOrganizationLearner);
};

const serializeCredentialsForDependent = function (scoOrganizationLearner) {
  return new Serializer('dependent-users', {
    id: 'organizationLearnerId',
    attributes: ['username', 'generatedPassword'],
  }).serialize(scoOrganizationLearner);
};

export { serializeCredentialsForDependent, serializeExternal, serializeIdentity, serializeWithUsernameGeneration };
