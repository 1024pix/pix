import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../src/identity-access-management/domain/constants/identity-providers.js';
import { AuthenticationMethod } from '../../../src/identity-access-management/domain/models/AuthenticationMethod.js';
import { PIX_ADMIN } from '../../../src/shared/constants.js';
import { Membership } from '../../../src/shared/domain/models/Membership.js';
import { DEFAULT_PASSWORD } from '../../constants.js';
import { databaseBuffer } from '../database-buffer.ts';
import { getUserHashedPassword } from './build-authentication-method.ts';
import { buildCertificationCenter } from './build-certification-center.js';
import { buildCertificationCenterMembership } from './build-certification-center-membership.js';
import { buildMembership } from './build-membership.js';
import { buildOrganization } from './build-organization.js';
import { buildPixAdminRole } from './build-pix-admin-role.ts';

const { ROLES } = PIX_ADMIN;

type UserAttributes = {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  username?: string | null;
  cgu?: boolean;
  lang?: string;
  locale?: string | null;
  lastTermsOfServiceValidatedAt?: Date | null;
  lastPixCertifTermsOfServiceValidatedAt?: Date | null;
  mustValidateTermsOfService?: boolean;
  pixCertifTermsOfServiceAccepted?: boolean;
  hasSeenAssessmentInstructions?: boolean;
  hasSeenNewDashboardInfo?: boolean;
  hasSeenFocusedChallengeTooltip?: boolean;
  hasSeenOtherChallengesTooltip?: boolean;
  isAnonymous?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  emailConfirmedAt?: Date | null;
  hasBeenAnonymised?: boolean;
  hasBeenAnonymisedBy?: number | null;
  lastDataProtectionPolicySeenAt?: Date | null;
};

type PasswordAttributes = {
  rawPassword?: string;
  shouldChangePassword?: boolean;
};

type UserWithRoleAttributes = UserAttributes &
  PasswordAttributes & {
    role?: string;
    disabledAt?: Date | null;
  };

const defaultEmail = (id: number, firstName: string, lastName: string) =>
  `${firstName}.${lastName}${id}@example.net`.replaceAll(/\s+/g, '_').toLowerCase();

const buildPixAuthenticationMethod = ({
  id = databaseBuffer.getNextId(),
  userId,
  rawPassword = DEFAULT_PASSWORD,
  shouldChangePassword,
  createdAt,
  updatedAt,
}: {
  id?: number;
  userId: number;
  rawPassword?: string;
  shouldChangePassword?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}) => {
  const values = {
    id,
    userId,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password: getUserHashedPassword(rawPassword),
      shouldChangePassword,
    }),
    externalIdentifier: undefined,
    createdAt,
    updatedAt,
  };

  return databaseBuffer.pushInsertable({ tableName: 'authentication-methods', values });
};

const buildUser = ({
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  email = defaultEmail(id, firstName, lastName),
  username = `${firstName}.${lastName}.${id}`,
  cgu = true,
  lang = 'fr',
  locale = null,
  lastTermsOfServiceValidatedAt = null,
  lastPixCertifTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  hasSeenNewDashboardInfo = false,
  hasSeenFocusedChallengeTooltip = false,
  hasSeenOtherChallengesTooltip = false,
  isAnonymous = false,
  createdAt = new Date(),
  updatedAt = new Date(),
  emailConfirmedAt = null,
  hasBeenAnonymised = false,
  hasBeenAnonymisedBy = null,
  lastDataProtectionPolicySeenAt = null,
}: UserAttributes = {}) => {
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
    lastPixCertifTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
    hasSeenNewDashboardInfo,
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

  return databaseBuffer.pushInsertable({ tableName: 'users', values });
};

buildUser.withRawPassword = ({
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  email = defaultEmail(id, firstName, lastName),
  username,
  cgu = true,
  lang = 'fr',
  locale,
  lastTermsOfServiceValidatedAt = new Date('2019-04-28T02:42:00Z'),
  lastPixCertifTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  createdAt = new Date(),
  updatedAt = new Date(),
  rawPassword = DEFAULT_PASSWORD,
  shouldChangePassword = false,
  emailConfirmedAt = new Date('2021-04-28T02:42:00Z'),
}: UserAttributes & PasswordAttributes = {}) => {
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
    lastPixCertifTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
    createdAt,
    updatedAt,
    emailConfirmedAt,
  };

  const user = databaseBuffer.pushInsertable({ tableName: 'users', values });

  buildPixAuthenticationMethod({ userId: user.id, rawPassword, shouldChangePassword, createdAt, updatedAt });

  return user;
};

buildUser.withoutPixAuthenticationMethod = ({
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  cgu = true,
  lang = 'fr',
  locale,
  lastTermsOfServiceValidatedAt = new Date('2019-04-28T02:42:00Z'),
  lastPixCertifTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  createdAt = new Date(),
}: UserAttributes = {}) => {
  const values = {
    id,
    firstName,
    lastName,
    cgu,
    lang,
    locale,
    lastTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
    createdAt,
  };

  return databaseBuffer.pushInsertable({ tableName: 'users', values });
};

buildUser.anonymous = ({
  id = databaseBuffer.getNextId(),
  firstName = '',
  lastName = '',
  email = null,
  username = null,
  cgu = false,
  hasSeenAssessmentInstructions = true,
  isAnonymous = true,
}: UserAttributes = {}) => {
  const values = {
    id,
    firstName,
    lastName,
    email,
    username,
    cgu,
    hasSeenAssessmentInstructions,
    isAnonymous,
  };

  return databaseBuffer.pushInsertable({ tableName: 'users', values });
};

const buildUserWithRole = ({
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  role = ROLES.SUPER_ADMIN,
  email = defaultEmail(id, firstName, lastName),
  cgu = true,
  lang = 'fr',
  locale,
  lastTermsOfServiceValidatedAt,
  lastPixCertifTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  createdAt = new Date(),
  updatedAt = new Date(),
  disabledAt,
  rawPassword = DEFAULT_PASSWORD,
  shouldChangePassword = false,
}: UserWithRoleAttributes = {}) => {
  const values = {
    id,
    firstName,
    lastName,
    email,
    cgu,
    lang,
    locale,
    lastTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
  };

  const user = databaseBuffer.pushInsertable({ tableName: 'users', values });

  buildPixAuthenticationMethod({ userId: user.id, rawPassword, shouldChangePassword, createdAt, updatedAt });

  buildPixAdminRole({ userId: user.id, role, disabledAt, createdAt, updatedAt });

  return user;
};

buildUser.withRole = buildUserWithRole;
buildUser.withRoleSuperAdmin = (attributes: UserWithRoleAttributes = {}) =>
  buildUserWithRole({ ...attributes, role: ROLES.SUPER_ADMIN });
buildUser.withRoleCertif = (attributes: UserWithRoleAttributes = {}) =>
  buildUserWithRole({ ...attributes, role: ROLES.CERTIF });

buildUser.withMembership = ({
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  email = defaultEmail(id, firstName, lastName),
  cgu = true,
  lang = 'fr',
  locale,
  lastTermsOfServiceValidatedAt,
  lastPixCertifTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  createdAt = new Date(),
  updatedAt = new Date(),
  organizationRole = Membership.roles.ADMIN,
  organizationId = null,
  rawPassword = DEFAULT_PASSWORD,
  shouldChangePassword = false,
}: UserAttributes & PasswordAttributes & { organizationRole?: string; organizationId?: number | null } = {}) => {
  const values = {
    id,
    firstName,
    lastName,
    email,
    cgu,
    lang,
    locale,
    lastTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
    createdAt,
    updatedAt,
  };

  const user = databaseBuffer.pushInsertable({ tableName: 'users', values });

  buildPixAuthenticationMethod({ userId: user.id, rawPassword, shouldChangePassword, createdAt, updatedAt });

  buildMembership({
    userId: user.id,
    organizationId: organizationId ?? buildOrganization().id,
    organizationRole,
  });

  return user;
};

buildUser.withCertificationCenterMembership = ({
  id = databaseBuffer.getNextId(),
  firstName = 'Billy',
  lastName = 'TheKid',
  email = defaultEmail(id, firstName, lastName),
  username = `${firstName}.${lastName}.${id}`,
  cgu = true,
  lang = 'fr',
  locale,
  lastTermsOfServiceValidatedAt = null,
  lastPixCertifTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  createdAt = new Date(),
  updatedAt = new Date(),
  certificationCenterId = null,
  role = 'MEMBER',
  membershipDisabledAt = null,
}: UserAttributes & {
  certificationCenterId?: number | null;
  role?: string;
  membershipDisabledAt?: Date | null;
} = {}) => {
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
    lastPixCertifTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
    createdAt,
    updatedAt,
  });

  buildCertificationCenterMembership({
    userId: user.id,
    certificationCenterId: certificationCenterId ?? buildCertificationCenter().id,
    role,
    disabledAt: membershipDisabledAt,
  });

  return user;
};

export { buildUser, type UserAttributes };
