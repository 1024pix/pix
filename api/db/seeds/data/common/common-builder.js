import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import {
  ADMINISTRATION_TEAM_ALPHA_ID,
  ADMINISTRATION_TEAM_ROCKET_ID,
  ADMINISTRATION_TEAM_SOLO_ID,
  ORGANIZATION_LEARNER_TYPE_PROFESSIONAL_ID,
  ORGANIZATION_LEARNER_TYPE_STUDENT_ID,
  ORGANIZATION_LEARNER_TYPE_TEACHER_ID,
} from '../team-acquisition/constants.js';
import {
  COLLEGE_TAG,
  COUNTRY_CANADA_CODE,
  COUNTRY_CANADA_ID,
  COUNTRY_FRANCE_CODE,
  COUNTRY_FRANCE_ID,
  COUNTRY_TOGO_CODE,
  COUNTRY_TOGO_ID,
  COUNTRY_VIETNAM_CODE,
  COUNTRY_VIETNAM_ID,
  PIX_PUBLIC_TARGET_PROFILE_ID,
  REAL_PIX_SUPER_ADMIN_ID,
} from './constants.js';
import { acceptPixOrgaTermsOfService, createPixOrgaTermsOfService } from './tooling/legal-documents.js';
import { createTargetProfile } from './tooling/target-profile-tooling.js';

const { ROLES } = PIX_ADMIN;

export const commonBuilder = async function ({ databaseBuilder }) {
  // countries
  _createCountries(databaseBuilder);

  // legal-document
  createPixOrgaTermsOfService(databaseBuilder);

  // administration teams
  _createAdministrationTeams(databaseBuilder);

  // organization learner types
  _createOrganizationLearnerTypes(databaseBuilder);

  // admin accounts
  _createSuperAdmin(databaseBuilder);
  _createCertifAdmin(databaseBuilder);
  _createSupportAdmin(databaseBuilder);
  _createMetierAdmin(databaseBuilder);

  createClientApplications(databaseBuilder);

  await _createPublicTargetProfile(databaseBuilder);
  await databaseBuilder.commit();
};

function _createAdministrationTeams(databaseBuilder) {
  _createAdministrationRocketTeam(databaseBuilder);
  _createAdministrationAlphaTeam(databaseBuilder);
  _createAdministrationSoloTeam(databaseBuilder);
}

function _createAdministrationRocketTeam(databaseBuilder) {
  databaseBuilder.factory.buildAdministrationTeam({
    id: ADMINISTRATION_TEAM_ROCKET_ID,
    name: 'Team Rocket',
  });
}

function _createAdministrationAlphaTeam(databaseBuilder) {
  databaseBuilder.factory.buildAdministrationTeam({
    id: ADMINISTRATION_TEAM_ALPHA_ID,
    name: 'Team Alpha',
  });
}

function _createAdministrationSoloTeam(databaseBuilder) {
  databaseBuilder.factory.buildAdministrationTeam({
    id: ADMINISTRATION_TEAM_SOLO_ID,
    name: 'Team Solo',
  });
}

function _createOrganizationLearnerTypes(databaseBuilder) {
  _createStudentOrganizationLearnerType(databaseBuilder);
  _createTeacherOrganizationLearnerType(databaseBuilder);
  _createProfessionalOrganizationLearnerType(databaseBuilder);
}

function _createStudentOrganizationLearnerType(databaseBuilder) {
  databaseBuilder.factory.buildOrganizationLearnerType({
    id: ORGANIZATION_LEARNER_TYPE_STUDENT_ID,
    name: 'Student',
  });
}

function _createTeacherOrganizationLearnerType(databaseBuilder) {
  databaseBuilder.factory.buildOrganizationLearnerType({
    id: ORGANIZATION_LEARNER_TYPE_TEACHER_ID,
    name: 'Teacher',
  });
}

function _createProfessionalOrganizationLearnerType(databaseBuilder) {
  databaseBuilder.factory.buildOrganizationLearnerType({
    id: ORGANIZATION_LEARNER_TYPE_PROFESSIONAL_ID,
    name: 'Professional',
  });
}

function _createCountries(databaseBuilder) {
  databaseBuilder.factory.buildCertificationCpfCountry({
    id: COUNTRY_CANADA_ID,
    code: COUNTRY_CANADA_CODE,
    commonName: 'CANADA',
    originalName: 'CANADA',
  });

  databaseBuilder.factory.buildCertificationCpfCountry({
    id: COUNTRY_FRANCE_ID,
    code: COUNTRY_FRANCE_CODE,
    commonName: 'FRANCE',
    originalName: 'FRANCE',
  });

  databaseBuilder.factory.buildCertificationCpfCountry({
    id: COUNTRY_TOGO_ID,
    code: COUNTRY_TOGO_CODE,
    commonName: 'TOGO',
    originalName: 'TOGO',
  });

  databaseBuilder.factory.buildCertificationCpfCountry({
    id: COUNTRY_VIETNAM_ID,
    code: COUNTRY_VIETNAM_CODE,
    commonName: 'VIET NAM',
    originalName: 'VIET NAM',
  });

  databaseBuilder.factory.buildCertificationCpfCountry({
    code: '99425',
    commonName: 'TURKS ET CAIQUES (ILES)',
    originalName: 'TURKS ET CAÏQUES (ÎLES)',
  });
}

function _createSuperAdmin(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: REAL_PIX_SUPER_ADMIN_ID,
    firstName: 'Admin',
    lastName: 'Admin',
    email: 'superadmin@example.net',
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: REAL_PIX_SUPER_ADMIN_ID, role: ROLES.SUPER_ADMIN });
  acceptPixOrgaTermsOfService(databaseBuilder, REAL_PIX_SUPER_ADMIN_ID);
}

function _createMetierAdmin(databaseBuilder) {
  const userId = REAL_PIX_SUPER_ADMIN_ID + 1;
  databaseBuilder.factory.buildUser.withRawPassword({
    id: userId,
    firstName: 'Admin',
    lastName: 'Metier',
    email: 'metieradmin@example.net',
  });
  databaseBuilder.factory.buildPixAdminRole({ userId, role: ROLES.METIER });
  acceptPixOrgaTermsOfService(databaseBuilder, userId);
}

function _createSupportAdmin(databaseBuilder) {
  const userId = REAL_PIX_SUPER_ADMIN_ID + 2;
  databaseBuilder.factory.buildUser.withRawPassword({
    id: userId,
    firstName: 'Admin',
    lastName: 'Support',
    email: 'supportadmin@example.net',
  });
  databaseBuilder.factory.buildPixAdminRole({ userId, role: ROLES.SUPPORT });
  acceptPixOrgaTermsOfService(databaseBuilder, userId);
}

function _createCertifAdmin(databaseBuilder) {
  const userId = REAL_PIX_SUPER_ADMIN_ID + 3;
  databaseBuilder.factory.buildUser.withRawPassword({
    id: userId,
    firstName: 'Admin',
    lastName: 'Certif',
    email: 'certifadmin@example.net',
  });
  databaseBuilder.factory.buildPixAdminRole({ userId, role: ROLES.CERTIF });
  acceptPixOrgaTermsOfService(databaseBuilder, userId);
}

function createClientApplications(databaseBuilder) {
  databaseBuilder.factory.buildClientApplication({
    name: 'livretScolaire',
    clientId: 'livretScolaire',
    clientSecret: 'livretScolaireSecret',
    scopes: ['organizations-certifications-result'],
  });
  databaseBuilder.factory.buildClientApplication({
    name: 'poleEmploi',
    clientId: 'poleEmploi',
    clientSecret: 'poleemploisecret',
    scopes: ['pole-emploi-participants-result'],
  });
  databaseBuilder.factory.buildClientApplication({
    name: 'pixData',
    clientId: 'pixData',
    clientSecret: 'pixdatasecret',
    scopes: ['statistics', 'replication'],
  });
  databaseBuilder.factory.buildClientApplication({
    name: 'parcoursup',
    clientId: 'parcoursup',
    clientSecret: 'parcoursup-secret-de-trente-deux-caracteres',
    scopes: ['parcoursup'],
  });
  databaseBuilder.factory.buildClientApplication({
    name: 'multi-organizations-client-application',
    clientId: 'maddo-client',
    clientSecret: 'maddo-secret',
    scopes: ['meta', 'campaigns'],
    jurisdiction: { rules: [{ name: 'tags', value: [COLLEGE_TAG.name] }] },
  });
  databaseBuilder.factory.buildClientApplication({
    name: 'poc-llm',
    clientId: 'poc-llm',
    clientSecret: 'poc-llm-secret',
    scopes: ['llm-preview'],
  });
}

function _createPublicTargetProfile(databaseBuilder) {
  return createTargetProfile({
    databaseBuilder,
    targetProfileId: PIX_PUBLIC_TARGET_PROFILE_ID,
    name: 'Profil Cible',
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
