import { Serializer } from 'jsonapi-serializer';

const serializeIdentity = function (scoOrganizationLearner) {
  return new Serializer('sco-organization-learner', {
    attributes: ['lastName', 'firstName', 'birthdate'],
  }).serialize(scoOrganizationLearner);
};

const serializeWithUsernameGeneration = function (scoOrganizationLearner) {
  return new Serializer('sco-organization-learner', {
    attributes: ['lastName', 'firstName', 'birthdate', 'username'],
  }).serialize(scoOrganizationLearner);
};

const serializeExternal = function (scoOrganizationLearner) {
  return new Serializer('external-users', {
    attributes: ['accessToken'],
  }).serialize(scoOrganizationLearner);
};

const serializeCredentialsForDependent = function (scoOrganizationLearner) {
  return new Serializer('dependent-users', {
    attributes: ['username', 'generatedPassword'],
  }).serialize(scoOrganizationLearner);
};

export { serializeIdentity, serializeWithUsernameGeneration, serializeExternal, serializeCredentialsForDependent };
