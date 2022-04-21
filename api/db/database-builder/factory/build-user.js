const isNil = require('lodash/isNil');
const isUndefined = require('lodash/isUndefined');

const databaseBuffer = require('../database-buffer');

const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');
const Membership = require('../../../lib/domain/models/Membership');

const encrypt = require('../../../lib/domain/services/encryption-service');

const buildPixAdminRole = require('./build-pix-admin-role');
const buildOrganization = require('./build-organization');
const buildMembership = require('./build-membership');
const buildCertificationCenter = require('./build-certification-center');
const buildCertificationCenterMembership = require('./build-certification-center-membership');

const { DEFAULT_PASSWORD } = require('../../seeds/data/users-builder');
const PixAdminRole = require('../../../lib/domain/models/PixAdminRole');

function _buildPixAuthenticationMethod({
  id = databaseBuffer.getNextId(),
  userId,
  rawPassword = DEFAULT_PASSWORD,
  shouldChangePassword,
  createdAt,
  updatedAt,
} = {}) {
  // eslint-disable-next-line no-sync
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
  lastPixOrgaTermsOfServiceValidatedAt = null,
  lastPixCertifTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  hasSeenNewDashboardInfo = false,
  hasSeenFocusedChallengeTooltip = false,
  hasSeenOtherChallengesTooltip = false,
  isAnonymous = false,
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {
  email = isUndefined(email) ? `${firstName}.${lastName}${id}@example.net`.toLowerCase() : email || null;

  const values = {
    id,
    firstName,
    lastName,
    email,
    username,
    cgu,
    lang,
    lastTermsOfServiceValidatedAt,
    lastPixOrgaTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
    hasSeenNewDashboardInfo,
    hasSeenFocusedChallengeTooltip,
    hasSeenOtherChallengesTooltip,
    isAnonymous,
    createdAt,
    updatedAt,
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
  lastPixOrgaTermsOfServiceValidatedAt = null,
  lastPixCertifTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  createdAt = new Date(),
  updatedAt = new Date(),
  rawPassword = DEFAULT_PASSWORD,
  shouldChangePassword = false,
} = {}) {
  email = isUndefined(email) ? `${firstName}.${lastName}${id}@example.net`.toLowerCase() : email || null;

  const values = {
    id,
    firstName,
    lastName,
    email,
    username,
    cgu,
    lang,
    lastTermsOfServiceValidatedAt,
    lastPixOrgaTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
    createdAt,
    updatedAt,
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

buildUser.withRoleSuperAdmin = function buildUserWithRoleSuperAdmin({
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  email,
  cgu = true,
  lang = 'fr',
  lastTermsOfServiceValidatedAt,
  lastPixOrgaTermsOfServiceValidatedAt = null,
  lastPixCertifTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  createdAt = new Date(),
  updatedAt = new Date(),

  rawPassword = DEFAULT_PASSWORD,
  shouldChangePassword = false,
} = {}) {
  email = isUndefined(email) ? `${firstName}.${lastName}${id}@example.net`.toLowerCase() : email || null;

  const values = {
    id,
    firstName,
    lastName,
    email,
    cgu,
    lang,
    lastTermsOfServiceValidatedAt,
    lastPixOrgaTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
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

  buildPixAdminRole({ userId: user.id, role: PixAdminRole.roles.SUPER_ADMIN });

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
  lastPixOrgaTermsOfServiceValidatedAt = null,
  lastPixCertifTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  createdAt = new Date(),
  updatedAt = new Date(),
  organizationRole = Membership.roles.ADMIN,
  organizationId = null,
  rawPassword = DEFAULT_PASSWORD,
  shouldChangePassword = false,
} = {}) {
  email = isUndefined(email) ? `${firstName}.${lastName}${id}@example.net`.toLowerCase() : email || null;

  const values = {
    id,
    firstName,
    lastName,
    email,
    cgu,
    lang,
    lastTermsOfServiceValidatedAt,
    lastPixOrgaTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
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
  lastPixOrgaTermsOfServiceValidatedAt = null,
  lastPixCertifTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
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
    lastPixOrgaTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
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
