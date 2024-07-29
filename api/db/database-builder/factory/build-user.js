import lodash from 'lodash';

const { isUndefined, isNil } = lodash;

import { PIX_ADMIN } from '../../../src/authorization/domain/constants.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../src/identity-access-management/domain/constants/identity-providers.js';
import { AuthenticationMethod, Membership } from '../../../src/shared/domain/models/index.js';
import { cryptoService } from '../../../src/shared/domain/services/crypto-service.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildCertificationCenter } from './build-certification-center.js';
import { buildCertificationCenterMembership } from './build-certification-center-membership.js';
import { buildMembership } from './build-membership.js';
import { buildOrganization } from './build-organization.js';
import { buildPixAdminRole } from './build-pix-admin-role.js';

const DEFAULT_PASSWORD = 'pix123';
const { ROLES } = PIX_ADMIN;

function _buildPixAuthenticationMethod({
  id = databaseBuffer.getNextId(),
  userId,
  rawPassword = DEFAULT_PASSWORD,
  shouldChangePassword,
  createdAt,
  updatedAt,
} = {}) {
  // eslint-disable-next-line no-sync
  const hashedPassword = cryptoService.hashPasswordSync(rawPassword);

  const values = {
    id,
    userId,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
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

function _generateEmailIfUndefined(email, id, lastName, firstName) {
  if (isUndefined(email)) {
    return `${firstName}.${lastName}${id}@example.net`.replaceAll(/\s+/g, '_').toLowerCase();
  }

  return email;
}

/**
 * @typedef SeedUser
 * @type {object}
 *
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} username
 * @property {boolean} cgu
 * @property {string} lang
 * @property {string} locale
 * @property {Date} lastTermsOfServiceValidatedAt
 * @property {Date} lastPixOrgaTermsOfServiceValidatedAt
 * @property {Date} lastPixCertifTermsOfServiceValidatedAt
 * @property {boolean} mustValidateTermsOfService
 * @property {boolean} pixOrgaTermsOfServiceAccepted
 * @property {boolean} pixCertifTermsOfServiceAccepted
 * @property {boolean} hasSeenAssessmentInstructions
 * @property {boolean} hasSeenNewDashboardInfo
 * @property {boolean} hasSeenLevelSevenInfo
 * @property {boolean} hasSeenFocusedChallengeTooltip
 * @property {boolean} hasSeenOtherChallengesTooltip
 * @property {boolean} isAnonymous
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date} emailConfirmedAt
 * @property {boolean} hasBeenAnonymised
 * @property {number} hasBeenAnonymisedBy
 * @property {Date} lastDataProtectionPolicySeenAt
 */
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
  hasSeenLevelSevenInfo = false,
  hasSeenFocusedChallengeTooltip = false,
  hasSeenOtherChallengesTooltip = false,
  isAnonymous = false,
  createdAt = new Date(),
  updatedAt = new Date(),
  emailConfirmedAt = null,
  hasBeenAnonymised = false,
  hasBeenAnonymisedBy = null,
  lastDataProtectionPolicySeenAt = null,
} = {}) {
  email = _generateEmailIfUndefined(email, id, lastName, firstName);

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
    hasSeenLevelSevenInfo,
    hasSeenFocusedChallengeTooltip,
    hasSeenOtherChallengesTooltip,
    isAnonymous,
    createdAt,
    updatedAt,
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
  emailConfirmedAt = new Date('2021-04-28T02:42:00Z'),
} = {}) {
  email = _generateEmailIfUndefined(email, id, lastName, firstName);

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
  email = _generateEmailIfUndefined(email, id, lastName, firstName);

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
  email = _generateEmailIfUndefined(email, id, lastName, firstName);

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
  role = 'MEMBER',
  membershipDisabledAt = null,
} = {}) {
  email = _generateEmailIfUndefined(email, id, lastName, firstName);

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
    role,
    disabledAt: membershipDisabledAt,
  });

  return user;
};

/**
 * @typedef {
 *  function(Partial<SeedUser>): SeedUser
 * } BuildUser
 */

export { buildUser };
