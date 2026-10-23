import { buildArchivedOrganizations } from './build-archived-organizations.js';
import { buildBlockedUsers } from './build-blocked-users.js';
import { buildCertificationCenters } from './build-certification-centers.js';
import { buildOidcProviders } from './build-oidc-providers.js';
import { buildOrganizationUsers } from './build-organization-users.js';
import { buildOrganizations } from './build-organizations.js';
import { buildResetPasswordUsers } from './build-reset-password-users.js';
import { buildScoOrganizationLearners } from './build-sco-organization-learners.js';
import { buildScoOrganizations } from './build-sco-organizations.js';
import { buildUsers } from './build-users.js';

export async function teamAccesDataBuilder(databaseBuilder) {
  buildUsers(databaseBuilder);
  buildBlockedUsers(databaseBuilder);
  buildResetPasswordUsers(databaseBuilder);
  buildOrganizationUsers(databaseBuilder);
  buildScoOrganizations(databaseBuilder);
  buildArchivedOrganizations(databaseBuilder);
  buildScoOrganizationLearners(databaseBuilder);
  await buildCertificationCenters(databaseBuilder);
  await buildOidcProviders(databaseBuilder);
  buildOrganizations(databaseBuilder);
}
