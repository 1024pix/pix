/* eslint-disable no-sync */
const faker = require('faker');

const isNil = require('lodash/isNil');
const isUndefined = require('lodash/isUndefined');

const databaseBuffer = require('../database-buffer');

const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');
const Membership = require('../../../lib/domain/models/Membership');

const encrypt = require('../../../lib/domain/services/encryption-service');

const buildUserPixRole = require('./build-user-pix-role');
const buildOrganization = require('./build-organization');
const buildMembership = require('./build-membership');

const PIX_MASTER_ROLE_ID = 1;

function _buildPixAuthenticationMethod({
  userId,
  password = 'Password123',
  shouldChangePassword,
  createdAt,
  updatedAt,
} = {}) {
  const hashedPassword = encrypt.hashPasswordSync(password);

  const values = {
    userId,
    identityProvider: AuthenticationMethod.identityProviders.PIX,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password: hashedPassword,
      shouldChangePassword,
    }),
    externalIdentifier: undefined,
    createdAt,
    updatedAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'authentication-methods',
    values,
  });
}

const buildUser = function buildUser({
  id,
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  email,
  username = firstName + '.' + lastName + faker.random.number({ min: 1000, max: 9999 }),
  cgu = true,
  lang = 'fr',
  lastTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  hasSeenNewLevelInfo = false,
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {

  email = isUndefined(email) ? faker.internet.exampleEmail(firstName, lastName).toLowerCase() : email || null;

  const values = {
    id, firstName, lastName, email, username,
    cgu, lang,
    lastTermsOfServiceValidatedAt, mustValidateTermsOfService, pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted, hasSeenAssessmentInstructions,
    hasSeenNewLevelInfo,
    createdAt, updatedAt,
    password: '',
    shouldChangePassword: false,
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
  cgu = true,
  lang = 'fr',
  lastTermsOfServiceValidatedAt,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  createdAt = new Date(),
  updatedAt = new Date(),

  password = 'Password123',
  shouldChangePassword = false,
} = {}) {

  const values = {
    id, firstName, lastName, email, username,
    cgu,
    lang,
    lastTermsOfServiceValidatedAt, mustValidateTermsOfService, pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted, hasSeenAssessmentInstructions,
    password: '',
    shouldChangePassword: false,
  };

  const user = databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });

  _buildPixAuthenticationMethod({
    userId: user.id,
    password,
    shouldChangePassword,
    createdAt,
    updatedAt,
  });

  return user;
};

buildUser.withPixRolePixMaster = function buildUserWithPixRolePixMaster({
  id,
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  email = faker.internet.exampleEmail().toLowerCase(),
  cgu = true,
  lang = 'fr',
  lastTermsOfServiceValidatedAt,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  createdAt = new Date(),
  updatedAt = new Date(),

  password = 'Password123',
  shouldChangePassword = false,
} = {}) {

  const values = {
    id, firstName, lastName, email,
    cgu,
    lang,
    lastTermsOfServiceValidatedAt, mustValidateTermsOfService, pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted, hasSeenAssessmentInstructions,
    password: '',
    shouldChangePassword: false,
  };

  const user = databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });

  _buildPixAuthenticationMethod({
    userId: user.id,
    password,
    shouldChangePassword,
    createdAt, updatedAt,
  });

  buildUserPixRole({ userId: user.id, pixRoleId: PIX_MASTER_ROLE_ID });

  return user;
};

buildUser.withMembership = function buildUserWithMemberships({
  id,
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  email = faker.internet.exampleEmail().toLowerCase(),
  cgu = true,
  lang = 'fr',
  lastTermsOfServiceValidatedAt,
  mustValidateTermsOfService,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  createdAt = new Date(),
  updatedAt = new Date(),

  organizationRole = Membership.roles.ADMIN,
  organizationId = null,

  password = 'Password123',
  shouldChangePassword = false,
} = {}) {

  const values = {
    id, firstName, lastName, email,
    cgu,
    lang,
    lastTermsOfServiceValidatedAt, mustValidateTermsOfService, pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted, hasSeenAssessmentInstructions,
    password: '',
    shouldChangePassword: false,
  };

  const user = databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });

  _buildPixAuthenticationMethod({
    userId: user.id,
    password,
    shouldChangePassword,
    createdAt, updatedAt,
  });

  organizationId = isNil(organizationId) ? buildOrganization().id : organizationId;

  buildMembership({
    userId: user.id,
    organizationId,
    organizationRole,
  });

  return user;
};

module.exports = buildUser;
