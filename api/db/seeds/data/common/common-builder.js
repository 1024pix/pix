import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { DEFAULT_PASSWORD, PIX_PUBLIC_TARGET_PROFILE_ID, REAL_PIX_SUPER_ADMIN_ID } from './constants.js';
import { createTargetProfile } from './tooling/target-profile-tooling.js';

const { ROLES } = PIX_ADMIN;

export const commonBuilder = async function ({ databaseBuilder }) {
  // admin account
  _createSuperAdmin(databaseBuilder);
  _createCertifAdmin(databaseBuilder);
  _createSupportAdmin(databaseBuilder);
  _createMetierAdmin(databaseBuilder);

  await _createPublicTargetProfile(databaseBuilder);
  await databaseBuilder.commit();
};

function _createSuperAdmin(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: REAL_PIX_SUPER_ADMIN_ID,
    firstName: 'Admin',
    lastName: 'Admin',
    email: 'superadmin@example.net',
    rawPassword: DEFAULT_PASSWORD,
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: REAL_PIX_SUPER_ADMIN_ID, role: ROLES.SUPER_ADMIN });
}

function _createMetierAdmin(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: REAL_PIX_SUPER_ADMIN_ID + 1,
    firstName: 'Admin',
    lastName: 'Metier',
    email: 'metieradmin@example.net',
    rawPassword: DEFAULT_PASSWORD,
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: REAL_PIX_SUPER_ADMIN_ID + 1, role: ROLES.METIER });
}

function _createSupportAdmin(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: REAL_PIX_SUPER_ADMIN_ID + 2,
    firstName: 'Admin',
    lastName: 'Support',
    email: 'supportadmin@example.net',
    rawPassword: DEFAULT_PASSWORD,
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: REAL_PIX_SUPER_ADMIN_ID + 2, role: ROLES.SUPPORT });
}

function _createCertifAdmin(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: REAL_PIX_SUPER_ADMIN_ID + 3,
    firstName: 'Admin',
    lastName: 'Certif',
    email: 'certifadmin@example.net',
    rawPassword: DEFAULT_PASSWORD,
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: REAL_PIX_SUPER_ADMIN_ID + 3, role: ROLES.CERTIF });
}

function _createPublicTargetProfile(databaseBuilder) {
  return createTargetProfile({
    databaseBuilder,
    targetProfileId: PIX_PUBLIC_TARGET_PROFILE_ID,
    ownerOrganizationId: null,
    isPublic: true,
    name: 'Profil Cible Public',
    configTargetProfile: {
      frameworks: [
        {
          chooseCoreFramework: true,
          countTubes: 2,
          minLevel: 2,
          maxLevel: 3,
        },
      ],
    },
  });
}
