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
const { ROLES } = require('../../../lib/domain/constants').PIX_ADMIN;

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

function _generateAnEmailIfNecessary(email, id, lastName, firstName) {
  if (isUndefined(email)) {
    return `${firstName}.${lastName}${id}@example.net`.replaceAll(/\s+/g, '_').toLowerCase();
  }
  if (email) {
    return email;
  }
  return null;
}

const buildUser = function buildUser({
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  email,
  username = `${firstName}.${lastName}.${id}`,
  cgu = true,
  lang = 'fr',
  locale,
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
  lastLoggedAt = new Date(),
  emailConfirmedAt = null,
  hasBeenAnonymised = false,
  hasBeenAnonymisedBy = null,
  lastDataProtectionPolicySeenAt = null,
} = {}) {
  email = _generateAnEmailIfNecessary(email, id, lastName, firstName);

  const values = {
    id,
    firstName,
    lastName,
    email,
    username,
    cgu,
    lang,
    locale,
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
    lastLoggedAt,
    emailConfirmedAt,
    hasBeenAnonymised,
    hasBeenAnonymisedBy,
    lastDataProtectionPolicySeenAt,
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
  locale,
  lastTermsOfServiceValidatedAt = new Date('2019-04-28T02:42:00Z'),
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
  lastLoggedAt = new Date('2022-04-28T02:42:00Z'),
  emailConfirmedAt = new Date('2021-04-28T02:42:00Z'),
} = {}) {
  email = _generateAnEmailIfNecessary(email, id, lastName, firstName);

  const values = {
    id,
    firstName,
    lastName,
    email,
    username,
    cgu,
    lang,
    locale,
    lastTermsOfServiceValidatedAt,
    lastPixOrgaTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
    createdAt,
    updatedAt,
    lastLoggedAt,
    emailConfirmedAt,
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

buildUser.withoutPixAuthenticationMethod = function buildUserWithoutPixAuthenticationMethod({
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  cgu = true,
  lang = 'fr',
  locale,
  lastTermsOfServiceValidatedAt = new Date('2019-04-28T02:42:00Z'),
  lastPixOrgaTermsOfServiceValidatedAt = null,
  lastPixCertifTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  createdAt = new Date(),
} = {}) {
  const values = {
    id,
    firstName,
    lastName,
    cgu,
    lang,
    locale,
    lastTermsOfServiceValidatedAt,
    lastPixOrgaTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
    createdAt,
  };

  const user = databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });

  return user;
};

buildUser.withRole = function buildUserWithRole({
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  role = ROLES.SUPER_ADMIN,
  email,
  cgu = true,
  lang = 'fr',
  locale,
  lastTermsOfServiceValidatedAt,
  lastPixOrgaTermsOfServiceValidatedAt = null,
  lastPixCertifTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  createdAt = new Date(),
  updatedAt = new Date(),
  disabledAt,
  rawPassword = DEFAULT_PASSWORD,
  shouldChangePassword = false,
} = {}) {
  email = _generateAnEmailIfNecessary(email, id, lastName, firstName);

  const values = {
    id,
    firstName,
    lastName,
    email,
    cgu,
    lang,
    locale,
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

  buildPixAdminRole({ userId: user.id, role, disabledAt, createdAt, updatedAt });

  return user;
};

buildUser.withMembership = function buildUserWithMemberships({
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  email,
  cgu = true,
  lang = 'fr',
  locale,
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
  email = _generateAnEmailIfNecessary(email, id, lastName, firstName);

  const values = {
    id,
    firstName,
    lastName,
    email,
    cgu,
    lang,
    locale,
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
  locale,
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
  email = _generateAnEmailIfNecessary(email, id, lastName, firstName);

  const user = buildUser({
    id,
    firstName,
    lastName,
    username,
    email,
    cgu,
    lang,
    locale,
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
