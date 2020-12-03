/* eslint-disable no-sync */
const faker = require('faker');
const databaseBuffer = require('../database-buffer');
const Membership = require('../../../lib/domain/models/Membership');
const encrypt = require('../../../lib/domain/services/encryption-service');
const buildUserPixRole = require('./build-user-pix-role');
const buildOrganization = require('./build-organization');
const buildMembership = require('./build-membership');
const _ = require('lodash');

const PIX_MASTER_ROLE_ID = 1;

const buildUser = function buildUser({
  id,
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  email,
  username = firstName + '.' + lastName + faker.random.number({ min: 1000, max: 9999 }),
  password,
  cgu = true,
  lang = 'fr',
  lastTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  shouldChangePassword = false,
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {

  password = _.isUndefined(password) ? encrypt.hashPasswordSync(faker.internet.password()) : encrypt.hashPasswordSync(password);
  email = _.isUndefined(email) ? faker.internet.exampleEmail(firstName, lastName).toLowerCase() : email || null;

  const values = {
    id, firstName, lastName, email, username, password, cgu, lang, lastTermsOfServiceValidatedAt, mustValidateTermsOfService, pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted, hasSeenAssessmentInstructions, shouldChangePassword, createdAt, updatedAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });
};

buildUser.withUnencryptedPassword = function buildUserWithUnencryptedPassword({
  id,
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  email = faker.internet.exampleEmail().toLowerCase(),
  username,
  rawPassword = faker.internet.password(),
  cgu = true,
  lang = 'fr',
  lastTermsOfServiceValidatedAt,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  shouldChangePassword = false,
}) {

  const password = encrypt.hashPasswordSync(rawPassword);

  const values = {
    id, firstName, lastName, email, username, password, cgu, lang, lastTermsOfServiceValidatedAt, mustValidateTermsOfService, pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted, hasSeenAssessmentInstructions, shouldChangePassword,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });
};

buildUser.withoutPassword = function buildUserWithoutPassword({
  id,
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  email = faker.internet.exampleEmail().toLowerCase(),
  username,
  password = '',
  cgu = true,
  lang = 'fr',
  lastTermsOfServiceValidatedAt,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  shouldChangePassword = false,
}) {

  const values = {
    id, firstName, lastName, email, username, password, cgu, lang, lastTermsOfServiceValidatedAt, mustValidateTermsOfService, pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted, hasSeenAssessmentInstructions, shouldChangePassword,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });
};

buildUser.withPixRolePixMaster = function buildUserWithPixRolePixMaster({
  id,
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  email = faker.internet.exampleEmail().toLowerCase(),
  password = encrypt.hashPasswordSync(faker.internet.password()),
  cgu = true,
  lang = 'fr',
  lastTermsOfServiceValidatedAt,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
} = {}) {

  const values = {
    id, firstName, lastName, email, password, cgu, lang, lastTermsOfServiceValidatedAt, mustValidateTermsOfService, pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted, hasSeenAssessmentInstructions,
  };

  const user = databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });

  buildUserPixRole({ userId: user.id, pixRoleId: PIX_MASTER_ROLE_ID });

  return user;
};

buildUser.withMembership = function buildUserWithMemberships({
  id,
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  email = faker.internet.exampleEmail().toLowerCase(),
  password = 'encrypt.hashPasswordSync(faker.internet.password())',
  cgu = true,
  lang = 'fr',
  lastTermsOfServiceValidatedAt,
  mustValidateTermsOfService,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  organizationRole = Membership.roles.ADMIN,
  organizationId = null,
} = {}) {

  const values = {
    id, firstName, lastName, email, password, cgu, lang, lastTermsOfServiceValidatedAt, mustValidateTermsOfService, pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted, hasSeenAssessmentInstructions,
  };

  organizationId = _.isNil(organizationId) ? buildOrganization().id : organizationId;

  const user = databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });

  buildMembership({
    userId: user.id,
    organizationId,
    organizationRole,
  });

  return user;
};

module.exports = buildUser;
