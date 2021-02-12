/* eslint-disable no-sync */

const isNil = require('lodash/isNil');
const isUndefined = require('lodash/isUndefined');

const databaseBuffer = require('../database-buffer');

const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');
const Membership = require('../../../lib/domain/models/Membership');

const encrypt = require('../../../lib/domain/services/encryption-service');

const buildUserPixRole = require('./build-user-pix-role');
const buildOrganization = require('./build-organization');
const buildMembership = require('./build-membership');
const buildCertificationCenter = require('./build-certification-center');
const buildCertificationCenterMembership = require('./build-certification-center-membership');

const PIX_MASTER_ROLE_ID = 1;

function _buildPixAuthenticationMethod({
  id = databaseBuffer.getNextId(),
  userId,
  rawPassword = 'Password123',
  shouldChangePassword,
  createdAt,
  updatedAt,
} = {}) {
  const hashedPassword = encrypt.hashPasswordSync(rawPassword);

  const values = {
    id,
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
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  email,
  username = `${firstName}.${lastName}.${id}`,
  cgu = true,
  lang = 'fr',
  lastTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  hasSeenNewLevelInfo = false,
  hasSeenNewDashboardInfo = false,
  isAnonymous = false,
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {

  email = isUndefined(email) ? `${firstName}.${lastName}${id}@example.net`.toLowerCase() : email || null;

  const values = {
    id, firstName, lastName, email, username,
    cgu, lang,
    lastTermsOfServiceValidatedAt, mustValidateTermsOfService, pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted, hasSeenAssessmentInstructions,
    hasSeenNewDashboardInfo,
    hasSeenNewLevelInfo, isAnonymous,
    createdAt, updatedAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });
};

buildUser.withRawPassword = function buildUserWithRawPassword({
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  email,
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
  rawPassword = 'Password123',
  shouldChangePassword = false,
} = {}) {

  email = isUndefined(email) ? `${firstName}.${lastName}${id}@example.net`.toLowerCase() : email || null;

  const values = {
    id, firstName, lastName, email, username,
    cgu,
    lang,
    lastTermsOfServiceValidatedAt, mustValidateTermsOfService, pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted, hasSeenAssessmentInstructions,
  };

  const user = databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });

  _buildPixAuthenticationMethod({
    userId: user.id,
    rawPassword,
    shouldChangePassword,
    createdAt,
    updatedAt,
  });

  return user;
};

buildUser.withPixRolePixMaster = function buildUserWithPixRolePixMaster({
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  email,
  cgu = true,
  lang = 'fr',
  lastTermsOfServiceValidatedAt,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  createdAt = new Date(),
  updatedAt = new Date(),

  rawPassword = 'Password123',
  shouldChangePassword = false,
} = {}) {

  email = isUndefined(email) ? `${firstName}.${lastName}${id}@example.net`.toLowerCase() : email || null;

  const values = {
    id, firstName, lastName, email,
    cgu,
    lang,
    lastTermsOfServiceValidatedAt, mustValidateTermsOfService, pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted, hasSeenAssessmentInstructions,
  };

  const user = databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });

  _buildPixAuthenticationMethod({
    userId: user.id,
    rawPassword,
    shouldChangePassword,
    createdAt, updatedAt,
  });

  buildUserPixRole({ userId: user.id, pixRoleId: PIX_MASTER_ROLE_ID });

  return user;
};

buildUser.withMembership = function buildUserWithMemberships({
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  email,
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
  rawPassword = 'Password123',
  shouldChangePassword = false,
} = {}) {

  email = isUndefined(email) ? `${firstName}.${lastName}${id}@example.net`.toLowerCase() : email || null;

  const values = {
    id, firstName, lastName, email,
    cgu,
    lang,
    lastTermsOfServiceValidatedAt, mustValidateTermsOfService, pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted, hasSeenAssessmentInstructions,
  };

  const user = databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });

  _buildPixAuthenticationMethod({
    userId: user.id,
    rawPassword,
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

buildUser.withCertificationCenterMembership = function buildUserWithCertificationCenterMembership({
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  email,
  username = `${firstName}.${lastName}.${id}`,
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
  certificationCenterId = null,
} = {}) {

  email = isUndefined(email) ? `${firstName}.${lastName}${id}@example.net`.toLowerCase() : email || null;

  const user = buildUser({
    id,
    firstName,
    lastName,
    username,
    email,
    cgu,
    lang,
    lastTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
    hasSeenNewLevelInfo,
    createdAt,
    updatedAt,
  });

  certificationCenterId = isNil(certificationCenterId) ? buildCertificationCenter().id : certificationCenterId;

  buildCertificationCenterMembership({
    userId: user.id,
    certificationCenterId,
  });

  return user;
};

module.exports = buildUser;
