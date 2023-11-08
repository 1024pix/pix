import { badges, DEFAULT_PASSWORD } from '../../../constants.js';
import { createTargetProfile } from './tooling/target-profile-tooling.js';

import { PRO_ORGANIZATION_ID } from './constants.js';
import { PIX_ADMIN } from '../../../../src/access/authorization/domain/constants.js';

const { ROLES } = PIX_ADMIN;

// IDS
// COMPLEMENTARY CERTIFICATIONS
const CLEA_COMPLEMENTARY_CERTIFICATION_ID = 52;
const PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID = 53;
const PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID = 54;
const PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID = 55;

// USERS
const REAL_PIX_SUPER_ADMIN_ID = 90000;

// TARGET PROFILES
const CLEA_V1_TARGET_PROFILE_ID = 56;
const CLEA_V2_TARGET_PROFILE_ID = 78;
const PIX_DROIT_TARGET_PROFILE_ID = 59;
const PIX_DROIT_TARGET_PROFILE_2_ID = 84;
const PIX_EDU_1ER_DEGRE_FI_TARGET_PROFILE_ID = 66;
const PIX_EDU_1ER_DEGRE_FC_TARGET_PROFILE_ID = 81;
const PIX_EDU_2ND_DEGRE_TARGET_PROFILE_ID = 67;
const PIX_PUBLIC_TARGET_PROFILE_ID = 76;

// CERTIFIABLE BADGES
const CLEA_V1_CERTIFIABLE_BADGE_ID = 57;
const CLEA_V2_CERTIFIABLE_BADGE_ID = 79;
const PIX_DROIT_INITIE_CERTIFIABLE_BADGE_ID = 60;
const PIX_DROIT_AVANCE_CERTIFIABLE_BADGE_ID = 61;
const PIX_DROIT_EXPERT_CERTIFIABLE_BADGE_ID = 62;
const PIX_EDU_1ER_DEGRE_FI_INITIE_CERTIFIABLE_BADGE_ID = 68;
const PIX_EDU_1ER_DEGRE_FI_CONFIRME_CERTIFIABLE_BADGE_ID = 69;
const PIX_EDU_1ER_DEGRE_FC_CONFIRME_CERTIFIABLE_BADGE_ID = 82;
const PIX_EDU_2ND_DEGRE_INITIE_CERTIFIABLE_BADGE_ID = 70;
const PIX_EDU_2ND_DEGRE_CONFIRME_CERTIFIABLE_BADGE_ID = 71;

// COMPLEMENTARY CERTIFICATION BADGES
const CLEA_V1_COMPLEMENTARY_CERTIFICATION_BADGE_ID = 58;
const CLEA_V2_COMPLEMENTARY_CERTIFICATION_BADGE_ID = 80;
const PIX_DROIT_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID = 63;
const PIX_EDU_1ER_DEGRE_FI_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID = 72;
const PIX_EDU_1ER_DEGRE_FI_CONFIRME_COMPLEMENTARY_CERTIFICATION_BADGE_ID = 73;
const PIX_EDU_1ER_DEGRE_FC_CONFIRME_COMPLEMENTARY_CERTIFICATION_BADGE_ID = 83;
const PIX_EDU_2ND_DEGRE_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID = 74;
const PIX_EDU_2ND_DEGRE_CONFIRME_COMPLEMENTARY_CERTIFICATION_BADGE_ID = 75;
const COLLEGE_TAG_ID = 8;

export {
  commonBuilder,
  COLLEGE_TAG_ID,
  CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
  CLEA_V1_TARGET_PROFILE_ID,
  PIX_DROIT_TARGET_PROFILE_ID,
  PIX_EDU_1ER_DEGRE_FI_TARGET_PROFILE_ID,
  PIX_EDU_1ER_DEGRE_FC_TARGET_PROFILE_ID,
  PIX_EDU_2ND_DEGRE_TARGET_PROFILE_ID,
  PIX_PUBLIC_TARGET_PROFILE_ID,
  CLEA_V1_CERTIFIABLE_BADGE_ID,
  PIX_DROIT_INITIE_CERTIFIABLE_BADGE_ID,
  PIX_DROIT_AVANCE_CERTIFIABLE_BADGE_ID,
  PIX_DROIT_EXPERT_CERTIFIABLE_BADGE_ID,
  PIX_EDU_1ER_DEGRE_FI_INITIE_CERTIFIABLE_BADGE_ID,
  PIX_EDU_1ER_DEGRE_FI_CONFIRME_CERTIFIABLE_BADGE_ID,
  PIX_EDU_1ER_DEGRE_FC_CONFIRME_CERTIFIABLE_BADGE_ID,
  PIX_EDU_2ND_DEGRE_INITIE_CERTIFIABLE_BADGE_ID,
  PIX_EDU_2ND_DEGRE_CONFIRME_CERTIFIABLE_BADGE_ID,
  CLEA_V1_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  PIX_DROIT_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  PIX_EDU_1ER_DEGRE_FI_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  PIX_EDU_1ER_DEGRE_FI_CONFIRME_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  PIX_EDU_1ER_DEGRE_FC_CONFIRME_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  PIX_EDU_2ND_DEGRE_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  PIX_EDU_2ND_DEGRE_CONFIRME_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  REAL_PIX_SUPER_ADMIN_ID,
};

async function commonBuilder({ databaseBuilder }) {
  _createSuperAdmin(databaseBuilder);
  _createTags(databaseBuilder);
  _createComplementaryCertifications(databaseBuilder);
  _createCountries(databaseBuilder);
  _createCities(databaseBuilder);
  await _createPublicTargetProfile(databaseBuilder);
  await databaseBuilder.commit();
}

function _createSuperAdmin(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: REAL_PIX_SUPER_ADMIN_ID,
    firstName: 'NextSuper',
    lastName: 'NextAdmin',
    email: 'superadmin@example.net',
    rawPassword: DEFAULT_PASSWORD,
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: REAL_PIX_SUPER_ADMIN_ID, role: ROLES.SUPER_ADMIN });
}

function _createTags(databaseBuilder) {
  databaseBuilder.factory.buildTag({ id: 1, name: 'AGRICULTURE' });
  databaseBuilder.factory.buildTag({ id: 2, name: 'PUBLIC' });
  databaseBuilder.factory.buildTag({ id: 3, name: 'PRIVE' });
  databaseBuilder.factory.buildTag({ id: 4, name: 'POLE EMPLOI' });
  databaseBuilder.factory.buildTag({ id: 5, name: 'CFA' });
  databaseBuilder.factory.buildTag({ id: 6, name: 'AEFE' });
  databaseBuilder.factory.buildTag({ id: 7, name: 'MEDNUM' });
  databaseBuilder.factory.buildTag({ id: COLLEGE_TAG_ID, name: 'COLLEGE' });
  databaseBuilder.factory.buildTag({ id: 9, name: 'LYCEE' });
}

function _createComplementaryCertifications(databaseBuilder) {
  _createClea(databaseBuilder);
  _createDroit(databaseBuilder);
  _createPixEdu1erDegre(databaseBuilder);
  _createPixEdu2ndDegre(databaseBuilder);
}

function _createClea(databaseBuilder) {
  databaseBuilder.factory.buildComplementaryCertification.clea({
    id: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  });
  databaseBuilder.factory.buildTargetProfile({
    id: CLEA_V1_TARGET_PROFILE_ID,
    imageUrl: 'https://images.pix.fr/profil-cible/Illu_GEN.svg',
    description: null,
    name: 'Parcours complet CléA numérique V1',
    isSimplifiedAccess: false,
    category: 'PREDEFINED',
    isPublic: true,
    ownerOrganizationId: PRO_ORGANIZATION_ID,
  });

  databaseBuilder.factory.buildTargetProfile({
    id: CLEA_V2_TARGET_PROFILE_ID,
    imageUrl: 'https://images.pix.fr/profil-cible/Illu_GEN.svg',
    description: null,
    name: 'Parcours complet CléA numérique V2',
    isSimplifiedAccess: false,
    category: 'PREDEFINED',
    isPublic: true,
    ownerOrganizationId: PRO_ORGANIZATION_ID,
  });
  [
    { tubeId: 'recs1vdbHxX8X55G9', level: 4 },
    { tubeId: 'recPOjwrHFhM21yGE', level: 4 },
    { tubeId: 'rec4RO6t7qai3ODuJ', level: 1 },
    { tubeId: 'recsoZIZxVEr3h2og', level: 3 },
    { tubeId: 'rec5D8oOcnSVc1wb5', level: 3 },
    { tubeId: 'recfRTGX0vJNzhApQ', level: 3 },
    { tubeId: 'recnIng2Rdw0drI7N', level: 4 },
    { tubeId: 'recN4ik49NYTUUbVm', level: 3 },
    { tubeId: 'reczOjAWmveW8RSkv', level: 2 },
    { tubeId: 'rec6pd87izEGLo6f3', level: 3 },
    { tubeId: 'recxZXtOPOhkPh1lv', level: 3 },
    { tubeId: 'recps4jQoK8zCW5wI', level: 2 },
    { tubeId: 'recIEuCfChJpc8UyH', level: 3 },
    { tubeId: 'recZ0A49dfpPvHvWd', level: 3 },
    { tubeId: 'recOq2Ds2MOC1N4TA', level: 3 },
    { tubeId: 'recf4znvmRGaGBUNQ', level: 3 },
    { tubeId: 'recy4WSQsbpvLjL1g', level: 3 },
    { tubeId: 'recpcdzdxDsnCjXZ6', level: 2 },
    { tubeId: 'recBYMZcjBilDqnq6', level: 3 },
    { tubeId: 'recRRCalqd5y2CyVD', level: 4 },
    { tubeId: 'tube1UYqjflF0Pm6Ny', level: 4 },
    { tubeId: 'recZfuVlR27qVXcAt', level: 3 },
    { tubeId: 'receqqprQt5h6k5mT', level: 4 },
    { tubeId: 'recjVAjbPUINn8yws', level: 3 },
    { tubeId: 'recwTYcY432rb0SGA', level: 4 },
    { tubeId: 'recEC0V9qBbLSqHhx', level: 3 },
    { tubeId: 'recZuHNGEtpCbBPUD', level: 3 },
    { tubeId: 'rec9EGJzkJxWn99Xs', level: 1 },
    { tubeId: 'reciWLZDyQmXNn6lc', level: 4 },
    { tubeId: 'recbH7WZIRE41pyVE', level: 3 },
    { tubeId: 'rec1Z5gkirQNvtjrK', level: 3 },
    { tubeId: 'recd3rYCdpWLtHXLk', level: 4 },
    { tubeId: 'recTNeDmFIhhWQZi9', level: 4 },
    { tubeId: 'recJNMNVcfrtCASrc', level: 2 },
    { tubeId: 'recwDOoEMBYSmwF4H', level: 3 },
    { tubeId: 'recFj3ODyi6whwFzk', level: 3 },
    { tubeId: 'recwoTBW9eVqCl7Vd', level: 4 },
    { tubeId: 'recrkpItPsNRg2OjJ', level: 2 },
    { tubeId: 'recgfnduLOzp90NdM', level: 3 },
    { tubeId: 'rec8ZcugJjxW0iwyb', level: 3 },
    { tubeId: 'rec5hclRSqG7gpadZ', level: 3 },
    { tubeId: 'recdm5W4IJMW07SzW', level: 3 },
    { tubeId: 'recgrxoIilcw9uj0U', level: 3 },
    { tubeId: 'recPtX9sny8yBBvn', level: 4 },
    { tubeId: 'rece5w6NqPCDo87zS', level: 3 },
    { tubeId: 'recpP9Uaz1x6qq95e', level: 4 },
    { tubeId: 'recYFCpGlmwQwAONl', level: 4 },
    { tubeId: 'recG7E3zypAJD3S05', level: 4 },
    { tubeId: 'recDLudOIi1rAjsFa', level: 3 },
    { tubeId: 'recoEnE6MhlBbJI8B', level: 3 },
    { tubeId: 'recj0sjmdK7hszB2n', level: 2 },
    { tubeId: 'rec2Vi2Bg4LdMmEjd', level: 2 },
    { tubeId: 'rectTJBNUL6lz0sEJ', level: 2 },
    { tubeId: 'rec3iPp178OrYNlDW', level: 4 },
    { tubeId: 'rectOrHRTau047Kyc', level: 3 },
    { tubeId: 'recgkQz2lN1XR2dIi', level: 2 },
    { tubeId: 'recEYqDKNYKhfXs7M', level: 1 },
    { tubeId: 'recc0vehnd9CuepzP', level: 2 },
    { tubeId: 'recoPAkxe29Ru3r3h', level: 3 },
    { tubeId: 'recInPPTW79jkUbEY', level: 3 },
    { tubeId: 'rec6Ic2FdcxSRYkdn', level: 2 },
  ].map(({ tubeId, level }) => {
    databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: CLEA_V1_TARGET_PROFILE_ID, tubeId, level });
    databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: CLEA_V2_TARGET_PROFILE_ID, tubeId, level });
  });

  databaseBuilder.factory.buildBadge({
    id: CLEA_V1_CERTIFIABLE_BADGE_ID,
    targetProfileId: CLEA_V1_TARGET_PROFILE_ID,
    message:
      'Bravo ! Vous maîtrisez les compétences indispensables pour utiliser le numérique en milieu professionnel. Pour valoriser vos compétences avec une double certification Pix-CléA numérique, renseignez-vous auprès de votre conseiller ou de votre formateur.',
    altMessage: 'Prêt pour le CléA numérique',
    key: badges.keys.PIX_EMPLOI_CLEA_V1,
    imageUrl: 'https://images.pix.fr/badges/Logos_badge_Prêt-CléA_Num NEW 2020.svg',
    title: 'Prêt pour le CléA numérique V1',
    isCertifiable: true,
    isAlwaysVisible: true,
  });
  databaseBuilder.factory.buildBadge({
    id: CLEA_V2_CERTIFIABLE_BADGE_ID,
    targetProfileId: CLEA_V2_TARGET_PROFILE_ID,
    message:
      'Bravo ! Vous maîtrisez les compétences indispensables pour utiliser le numérique en milieu professionnel. Pour valoriser vos compétences avec une double certification Pix-CléA numérique, renseignez-vous auprès de votre conseiller ou de votre formateur.',
    altMessage: 'Prêt pour le CléA numérique',
    key: badges.keys.PIX_EMPLOI_CLEA_V2,
    imageUrl: 'https://images.pix.fr/badges/Logos_badge_Prêt-CléA_Num NEW 2020.svg',
    title: 'Prêt pour le CléA numérique V2',
    isCertifiable: true,
    isAlwaysVisible: true,
  });
  [
    { scope: 'CampaignParticipation', threshold: 80, cappedTubes: 'null', name: null },
    {
      scope: 'CappedTubes',
      threshold: 80,
      cappedTubes:
        '[{"id":"recZ0A49dfpPvHvWd","level":3},{"id":"recOq2Ds2MOC1N4TA","level":3},{"id":"recIEuCfChJpc8UyH","level":3},{"id":"recfRTGX0vJNzhApQ","level":3},{"id":"recps4jQoK8zCW5wI","level":2},{"id":"rec6pd87izEGLo6f3","level":3},{"id":"recxZXtOPOhkPh1lv","level":3},{"id":"recf4znvmRGaGBUNQ","level":3},{"id":"recBYMZcjBilDqnq6","level":3},{"id":"recrkpItPsNRg2OjJ","level":2},{"id":"recgfnduLOzp90NdM","level":3},{"id":"rec5hclRSqG7gpadZ","level":3},{"id":"recdm5W4IJMW07SzW","level":3},{"id":"rec8ZcugJjxW0iwyb","level":3},{"id":"rec3iPp178OrYNlDW","level":4},{"id":"rectOrHRTau047Kyc","level":3},{"id":"recEYqDKNYKhfXs7M","level":1},{"id":"recc0vehnd9CuepzP","level":2},{"id":"recoPAkxe29Ru3r3h","level":3},{"id":"rec6Ic2FdcxSRYkdn","level":2},{"id":"recInPPTW79jkUbEY","level":3}]',
      name: 'Compétence 1 CléA numérique validée',
    },
    {
      scope: 'CappedTubes',
      threshold: 80,
      cappedTubes:
        '[{"id":"recs1vdbHxX8X55G9","level":4},{"id":"rec4RO6t7qai3ODuJ","level":1},{"id":"recsoZIZxVEr3h2og","level":3},{"id":"rec5D8oOcnSVc1wb5","level":3},{"id":"recPOjwrHFhM21yGE","level":4},{"id":"recjVAjbPUINn8yws","level":3},{"id":"recwTYcY432rb0SGA","level":4},{"id":"receqqprQt5h6k5mT","level":4},{"id":"recZuHNGEtpCbBPUD","level":3},{"id":"recJNMNVcfrtCASrc","level":2}]',
      name: 'Compétence 2 CléA numérique validée',
    },
    {
      scope: 'CappedTubes',
      threshold: 80,
      cappedTubes:
        '[{"id":"recy4WSQsbpvLjL1g","level":3},{"id":"recRRCalqd5y2CyVD","level":4},{"id":"recpcdzdxDsnCjXZ6","level":2},{"id":"tube1UYqjflF0Pm6Ny","level":4},{"id":"recZfuVlR27qVXcAt","level":3},{"id":"recEC0V9qBbLSqHhx","level":3},{"id":"rec9EGJzkJxWn99Xs","level":1},{"id":"reciWLZDyQmXNn6lc","level":4},{"id":"recbH7WZIRE41pyVE","level":3},{"id":"rec1Z5gkirQNvtjrK","level":3},{"id":"recd3rYCdpWLtHXLk","level":4},{"id":"recwDOoEMBYSmwF4H","level":3}]',
      name: 'Compétence 3 CléA numérique validée',
    },
    {
      scope: 'CappedTubes',
      threshold: 80,
      cappedTubes:
        '[{"id":"recN4ik49NYTUUbVm","level":3},{"id":"reczOjAWmveW8RSkv","level":2},{"id":"recnIng2Rdw0drI7N","level":4},{"id":"recTNeDmFIhhWQZi9","level":4},{"id":"recFj3ODyi6whwFzk","level":3},{"id":"recwoTBW9eVqCl7Vd","level":4},{"id":"recgrxoIilcw9uj0U","level":3},{"id":"recG7E3zypAJD3S05","level":4},{"id":"recDLudOIi1rAjsFa","level":3},{"id":"recoEnE6MhlBbJI8B","level":3},{"id":"rece5w6NqPCDo87zS","level":3},{"id":"recj0sjmdK7hszB2n","level":2},{"id":"recYFCpGlmwQwAONl","level":4},{"id":"recpP9Uaz1x6qq95e","level":4},{"id":"recPtX9sny8yBBvn","level":4},{"id":"rectTJBNUL6lz0sEJ","level":2},{"id":"rec2Vi2Bg4LdMmEjd","level":2},{"id":"recgkQz2lN1XR2dIi","level":2}]',
      name: 'Compétence 4 CléA numérique validée',
    },
  ].map(({ scope, threshold, cappedTubes, name }) => {
    databaseBuilder.factory.buildBadgeCriterion({
      badgeId: CLEA_V1_CERTIFIABLE_BADGE_ID,
      scope,
      threshold,
      cappedTubes,
      name,
    });
    databaseBuilder.factory.buildBadgeCriterion({
      badgeId: CLEA_V2_CERTIFIABLE_BADGE_ID,
      scope,
      threshold,
      cappedTubes,
      name,
    });
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: CLEA_V1_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
    badgeId: CLEA_V1_CERTIFIABLE_BADGE_ID,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
    level: 1,
    imageUrl: 'https://images.pix.fr/badges/CleA_Num_certif.svg',
    label: 'CléA Numérique V1',
    certificateMessage: null,
    temporaryCertificateMessage: null,
    stickerUrl: 'https://images.pix.fr/stickers/macaron_clea.pdf',
    createdAt: new Date('2020-01-01'),
    detachedAt: new Date('2021-01-01'),
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: CLEA_V2_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
    badgeId: CLEA_V2_CERTIFIABLE_BADGE_ID,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
    level: 1,
    imageUrl: 'https://images.pix.fr/badges/CleA_Num_certif.svg',
    label: 'CléA Numérique V2',
    certificateMessage: null,
    temporaryCertificateMessage: null,
    stickerUrl: 'https://images.pix.fr/stickers/macaron_clea.pdf',
    createdAt: new Date('2021-01-01'),
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
  });
}

function _createDroit(databaseBuilder) {
  databaseBuilder.factory.buildComplementaryCertification.droit({
    id: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  });
  databaseBuilder.factory.buildTargetProfile({
    id: PIX_DROIT_TARGET_PROFILE_ID,
    imageUrl: 'https://images.pix.fr/profil-cible/Illu_GEN.svg',
    description: null,
    name: '[Pix+Droit] Prêt pour la certification',
    isSimplifiedAccess: false,
    category: 'PREDEFINED',
    isPublic: true,
    ownerOrganizationId: PRO_ORGANIZATION_ID,
  });
  [
    { tubeId: 'reccqGUKgzIOK8f9U', level: 8 },
    { tubeId: 'rec4RO6t7qai3ODuJ', level: 8 },
    { tubeId: 'recBbCIEKgrQi7eb6', level: 8 },
    { tubeId: 'recsoZIZxVEr3h2og', level: 8 },
    { tubeId: 'recYmSqXBdRWCbTL6', level: 8 },
    { tubeId: 'recqjSAxTnNej5zSQ', level: 8 },
    { tubeId: 'rec5D8oOcnSVc1wb5', level: 8 },
    { tubeId: 'recPOjwrHFhM21yGE', level: 8 },
    { tubeId: 'recpe7Y8Wq2D56q6I', level: 8 },
    { tubeId: 'recYwQBNHPtwEIchq', level: 8 },
    { tubeId: 'reco9L9TNFYvZ4Bt6', level: 8 },
    { tubeId: 'recpQLhHdOTQAx6UL', level: 8 },
    { tubeId: 'reckFeg9YextW6q9P', level: 8 },
    { tubeId: 'recS1VZiU2ZNQEJey', level: 8 },
    { tubeId: 'recIEuCfChJpc8UyH', level: 8 },
    { tubeId: 'recjNL8mBDttF4lPC', level: 8 },
    { tubeId: 'recqIeeEoWE0siJz8', level: 8 },
    { tubeId: 'recl6FCNC8DBsclHV', level: 8 },
    { tubeId: 'recfRTGX0vJNzhApQ', level: 8 },
    { tubeId: 'recN4ik49NYTUUbVm', level: 8 },
    { tubeId: 'recwanhWqP3VMPic1', level: 8 },
    { tubeId: 'recps4jQoK8zCW5wI', level: 8 },
    { tubeId: 'reczOjAWmveW8RSkv', level: 8 },
    { tubeId: 'recnIng2Rdw0drI7N', level: 8 },
    { tubeId: 'rec1gP2RFbGcAaKC3', level: 8 },
    { tubeId: 'recxZXtOPOhkPh1lv', level: 8 },
    { tubeId: 'recXz8qMNXvEwIPlO', level: 8 },
    { tubeId: 'recMaijlrK3flRbBs', level: 8 },
    { tubeId: 'recf4znvmRGaGBUNQ', level: 8 },
    { tubeId: 'rec4rdlxGTmlbrNLb', level: 8 },
    { tubeId: 'recy4WSQsbpvLjL1g', level: 8 },
    { tubeId: 'recRRCalqd5y2CyVD', level: 8 },
    { tubeId: 'recpcdzdxDsnCjXZ6', level: 8 },
    { tubeId: 'recBYMZcjBilDqnq6', level: 8 },
    { tubeId: 'recVpHG0NDURRRycg', level: 8 },
    { tubeId: 'recyNCBKtjN1MN1mZ', level: 8 },
    { tubeId: 'recBVgidqYpPfWMeu', level: 8 },
    { tubeId: 'recb576QI4qODr9EQ', level: 8 },
    { tubeId: 'recH9oeseHQA74aZJ', level: 8 },
    { tubeId: 'recjVAjbPUINn8yws', level: 8 },
    { tubeId: 'recZfuVlR27qVXcAt', level: 8 },
    { tubeId: 'reco6VV9D3Zm0jHo9', level: 8 },
    { tubeId: 'rec7xyIH2SyMeWh0Y', level: 8 },
    { tubeId: 'recwTYcY432rb0SGA', level: 8 },
    { tubeId: 'receqqprQt5h6k5mT', level: 8 },
    { tubeId: 'recEC0V9qBbLSqHhx', level: 8 },
    { tubeId: 'recZuHNGEtpCbBPUD', level: 8 },
    { tubeId: 'reciWLZDyQmXNn6lc', level: 8 },
    { tubeId: 'recbH7WZIRE41pyVE', level: 8 },
    { tubeId: 'rec1Z5gkirQNvtjrK', level: 8 },
    { tubeId: 'recd3rYCdpWLtHXLk', level: 8 },
    { tubeId: 'recTNeDmFIhhWQZi9', level: 8 },
    { tubeId: 'recwDOoEMBYSmwF4H', level: 8 },
    { tubeId: 'recHMYN8ZwOUX63ck', level: 8 },
    { tubeId: 'recuvo92yAymf7l3r', level: 8 },
    { tubeId: 'recFj3ODyi6whwFzk', level: 8 },
    { tubeId: 'recwoTBW9eVqCl7Vd', level: 8 },
    { tubeId: 'recGTIO2R0edgARcA', level: 8 },
    { tubeId: 'recJmEjTV9NacUqZ8', level: 8 },
    { tubeId: 'recgkzKSGhyw1Gwtz', level: 8 },
    { tubeId: 'recIMsNGpsxv2GSCI', level: 8 },
    { tubeId: 'rec38YpXqa8RtM1Yy', level: 8 },
    { tubeId: 'recVyULQAf8zFXjCg', level: 8 },
    { tubeId: 'recTVcQOH3zhL8h29', level: 8 },
    { tubeId: 'recdd0tt0BaQxeSj5', level: 8 },
    { tubeId: 'recgPVFxgVPDUkQWX', level: 8 },
    { tubeId: 'reczBuVhH7fuC4u3k', level: 8 },
    { tubeId: 'rec5hclRSqG7gpadZ', level: 8 },
    { tubeId: 'recY3xrzPegD40fkO', level: 8 },
    { tubeId: 'recPS09GOFlMbp6dF', level: 8 },
    { tubeId: 'recdm5W4IJMW07SzW', level: 8 },
    { tubeId: 'recf0RoWlVKSMke8l', level: 8 },
    { tubeId: 'recgrxoIilcw9uj0U', level: 8 },
    { tubeId: 'rec8lYF4iaCcI6Stl', level: 8 },
    { tubeId: 'recpz9gZET6VJFeen', level: 8 },
    { tubeId: 'recG7E3zypAJD3S05', level: 8 },
    { tubeId: 'rece5w6NqPCDo87zS', level: 8 },
    { tubeId: 'recYFCpGlmwQwAONl', level: 8 },
    { tubeId: 'recpP9Uaz1x6qq95e', level: 8 },
    { tubeId: 'rectTJBNUL6lz0sEJ', level: 8 },
    { tubeId: 'rec1qBTb7CtGB0GmO', level: 8 },
    { tubeId: 'recZOEoQzjBUQR9hw', level: 8 },
    { tubeId: 'rechtUc7ZgECYIPJD', level: 8 },
    { tubeId: 'rec2Vi2Bg4LdMmEjd', level: 8 },
    { tubeId: 'recW9R9lBG3faLOzL', level: 8 },
    { tubeId: 'recbz4xiCLHV8IpIQ', level: 8 },
    { tubeId: 'recfqLvN8H2ZHuolK', level: 8 },
    { tubeId: 'recqkCYIBRlqH7IoT', level: 8 },
    { tubeId: 'recMvKBYMz7qjPn5o', level: 8 },
    { tubeId: 'recDXjekxwm1Nh77T', level: 8 },
    { tubeId: 'recvalrsm02e63lw4', level: 8 },
    { tubeId: 'recT17TO1XinYCD95', level: 8 },
    { tubeId: 'recdj5xs1qIji4Ov1', level: 8 },
    { tubeId: 'recPXUEpkQWNTNtIy', level: 8 },
    { tubeId: 'rec1cPa44IY0W7opU', level: 8 },
    { tubeId: 'recw2N2l25dhAvKEk', level: 8 },
    { tubeId: 'recUdaazeg9ab1x8', level: 8 },
    { tubeId: 'rec1kppf5qSULXL88', level: 8 },
    { tubeId: 'rec23TMwZJMWYrLLB', level: 8 },
    { tubeId: 'rec1xrHLjM3wKKBQw', level: 8 },
    { tubeId: 'rec1zfqGYUlb9kpc7', level: 8 },
    { tubeId: 'rec1iJyutGqz908KP', level: 8 },
    { tubeId: 'rec1yOOnDKBhlFQCI', level: 8 },
    { tubeId: 'recOhQQlfrVd0BRi', level: 8 },
    { tubeId: 'rec1kv8fMxTH78n3N', level: 8 },
    { tubeId: 'rec1JqLswIdY95dN3', level: 8 },
    { tubeId: 'rec2QhdQyHvT2cBj8', level: 8 },
    { tubeId: 'rec1fXDQN6aZ0ViRG', level: 8 },
    { tubeId: 'rec250gcsxlgbZn5X', level: 8 },
    { tubeId: 'rec1HGzIiFxjlUxNB', level: 8 },
    { tubeId: 'rec2UnGTFHI3r9X3X', level: 8 },
    { tubeId: 'rec1rIR8Hclrsf0hl', level: 8 },
    { tubeId: 'rec2wTqyy3zktkbxV', level: 8 },
    { tubeId: 'rec2xdZagxRWcwDhV', level: 8 },
    { tubeId: 'rec1UPUQezJx8za0f', level: 8 },
    { tubeId: 'recX2jhH6LhKZEJ7', level: 8 },
    { tubeId: 'rec1MpmrTmc1UCjQK', level: 8 },
    { tubeId: 'rec2CYg3zJ9YgWgUb', level: 8 },
    { tubeId: 'rec1F7qIWWrzF8Xw7', level: 8 },
    { tubeId: 'rec1eOLUhvXknmwpI', level: 8 },
    { tubeId: 'rec2LMAxDvFwNtp0i', level: 8 },
    { tubeId: 'rec1hjijhETLVEwzT', level: 8 },
    { tubeId: 'rec2W69xY3ur09POW', level: 8 },
    { tubeId: 'rec1qf3vKmtVpSxV5', level: 8 },
    { tubeId: 'rec1hB329odC48vly', level: 8 },
    { tubeId: 'reci4a7xQ6WHIS2Yj', level: 8 },
    { tubeId: 'rec1EG7WD94hbrS0H', level: 8 },
    { tubeId: 'rec2jUsAg9mBoYvI2', level: 8 },
    { tubeId: 'rec2FOwJDYa0MIkQC', level: 8 },
    { tubeId: 'rec2ivYOe3ngcFkdj', level: 8 },
    { tubeId: 'rec1xDldqZ9YxvCia', level: 8 },
    { tubeId: 'rec1BJz3VsSR2Uisa', level: 8 },
    { tubeId: 'rec1oMAncy43788q1', level: 8 },
    { tubeId: 'rec1NzNK4W4H4pfoT', level: 8 },
    { tubeId: 'rec1lNAycEstOUzJf', level: 8 },
    { tubeId: 'rec1xvCPKkkX7AUe9', level: 8 },
    { tubeId: 'recLpYKlAA1oFGLn', level: 8 },
    { tubeId: 'rec1uICWmlljuT5V5', level: 8 },
    { tubeId: 'rec2cpjZvMs9zvN5T', level: 8 },
    { tubeId: 'recR24FjsvimWNmk', level: 8 },
    { tubeId: 'rec2lwNCubUyn4heA', level: 8 },
  ].map(({ tubeId, level }) => {
    databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: PIX_DROIT_TARGET_PROFILE_ID, tubeId, level });
  });

  databaseBuilder.factory.buildTargetProfile({
    id: PIX_DROIT_TARGET_PROFILE_2_ID,
    imageUrl: 'https://images.pix.fr/profil-cible/Illu_GEN.svg',
    description: null,
    name: '[Pix+Droit (PC 2)] Prêt pour la certification',
    isSimplifiedAccess: false,
    category: 'PREDEFINED',
    isPublic: true,
    ownerOrganizationId: PRO_ORGANIZATION_ID,
  });

  databaseBuilder.factory.buildBadge({
    id: PIX_DROIT_AVANCE_CERTIFIABLE_BADGE_ID,
    targetProfileId: PIX_DROIT_TARGET_PROFILE_2_ID,
    message:
      "Félicitations ! Votre profil est prêt pour vous présenter à une certification Pix+Droit de niveau Avancé. Vous avez fait preuve d'une maîtrise des compétences numériques nécessaires à l'exercice des métiers du droit dans tous les domaines. En perfectionnant encore vos compétences, vous pourrez obtenir le niveau Expert.",
    altMessage: 'Pix+Droit niveau Avancé',
    imageUrl: 'https://images.pix.fr/badges/badge_pix-PIX_DROIT_silver%20copy.svg',
    key: badges.keys.PIX_DROIT_AVANCE_CERTIF,
    title: 'Pix+Droit niveau Avancé',
    isCertifiable: true,
    isAlwaysVisible: false,
  });

  [
    {
      scope: 'CappedTubes',
      threshold: 70,
      cappedTubes:
        '[{"id":"reccqGUKgzIOK8f9U","level":4},{"id":"rec4RO6t7qai3ODuJ","level":5},{"id":"recBbCIEKgrQi7eb6","level":6},{"id":"recsoZIZxVEr3h2og","level":5},{"id":"recYmSqXBdRWCbTL6","level":6},{"id":"recqjSAxTnNej5zSQ","level":6},{"id":"rec5D8oOcnSVc1wb5","level":6},{"id":"recPOjwrHFhM21yGE","level":5},{"id":"recpe7Y8Wq2D56q6I","level":7},{"id":"recYwQBNHPtwEIchq","level":4},{"id":"reco9L9TNFYvZ4Bt6","level":6},{"id":"recpQLhHdOTQAx6UL","level":7},{"id":"reckFeg9YextW6q9P","level":6},{"id":"recS1VZiU2ZNQEJey","level":6},{"id":"recIEuCfChJpc8UyH","level":6},{"id":"recjNL8mBDttF4lPC","level":4},{"id":"recqIeeEoWE0siJz8","level":4},{"id":"recl6FCNC8DBsclHV","level":4},{"id":"recfRTGX0vJNzhApQ","level":6},{"id":"recN4ik49NYTUUbVm","level":5},{"id":"recwanhWqP3VMPic1","level":5},{"id":"recps4jQoK8zCW5wI","level":5},{"id":"reczOjAWmveW8RSkv","level":6},{"id":"recnIng2Rdw0drI7N","level":4},{"id":"rec1gP2RFbGcAaKC3","level":5},{"id":"recxZXtOPOhkPh1lv","level":4},{"id":"recXz8qMNXvEwIPlO","level":5},{"id":"recMaijlrK3flRbBs","level":3},{"id":"recf4znvmRGaGBUNQ","level":5},{"id":"rec4rdlxGTmlbrNLb","level":6},{"id":"recy4WSQsbpvLjL1g","level":5},{"id":"recRRCalqd5y2CyVD","level":6},{"id":"recpcdzdxDsnCjXZ6","level":4},{"id":"recBYMZcjBilDqnq6","level":5},{"id":"recVpHG0NDURRRycg","level":5},{"id":"recyNCBKtjN1MN1mZ","level":5},{"id":"recBVgidqYpPfWMeu","level":4},{"id":"recb576QI4qODr9EQ","level":5},{"id":"recH9oeseHQA74aZJ","level":4},{"id":"recjVAjbPUINn8yws","level":4},{"id":"recZfuVlR27qVXcAt","level":4},{"id":"reco6VV9D3Zm0jHo9","level":5},{"id":"rec7xyIH2SyMeWh0Y","level":3},{"id":"recwTYcY432rb0SGA","level":5},{"id":"receqqprQt5h6k5mT","level":6},{"id":"recEC0V9qBbLSqHhx","level":5},{"id":"recZuHNGEtpCbBPUD","level":5},{"id":"reciWLZDyQmXNn6lc","level":4},{"id":"recbH7WZIRE41pyVE","level":6},{"id":"rec1Z5gkirQNvtjrK","level":5},{"id":"recd3rYCdpWLtHXLk","level":6},{"id":"recTNeDmFIhhWQZi9","level":4},{"id":"recwDOoEMBYSmwF4H","level":3},{"id":"recHMYN8ZwOUX63ck","level":5},{"id":"recuvo92yAymf7l3r","level":5},{"id":"recFj3ODyi6whwFzk","level":3},{"id":"recwoTBW9eVqCl7Vd","level":5},{"id":"recGTIO2R0edgARcA","level":3},{"id":"recJmEjTV9NacUqZ8","level":5},{"id":"recgkzKSGhyw1Gwtz","level":6},{"id":"recIMsNGpsxv2GSCI","level":6},{"id":"rec38YpXqa8RtM1Yy","level":6},{"id":"recVyULQAf8zFXjCg","level":5},{"id":"recTVcQOH3zhL8h29","level":7},{"id":"recdd0tt0BaQxeSj5","level":6},{"id":"recgPVFxgVPDUkQWX","level":5},{"id":"reczBuVhH7fuC4u3k","level":6},{"id":"rec5hclRSqG7gpadZ","level":6},{"id":"recY3xrzPegD40fkO","level":5},{"id":"recPS09GOFlMbp6dF","level":5},{"id":"recdm5W4IJMW07SzW","level":4},{"id":"recf0RoWlVKSMke8l","level":6},{"id":"recgrxoIilcw9uj0U","level":5},{"id":"rec8lYF4iaCcI6Stl","level":6},{"id":"recpz9gZET6VJFeen","level":5},{"id":"recG7E3zypAJD3S05","level":5},{"id":"rece5w6NqPCDo87zS","level":4},{"id":"recYFCpGlmwQwAONl","level":5},{"id":"recpP9Uaz1x6qq95e","level":4},{"id":"rectTJBNUL6lz0sEJ","level":4},{"id":"rec1qBTb7CtGB0GmO","level":6},{"id":"recZOEoQzjBUQR9hw","level":5},{"id":"rechtUc7ZgECYIPJD","level":3},{"id":"rec2Vi2Bg4LdMmEjd","level":2},{"id":"recW9R9lBG3faLOzL","level":4},{"id":"recbz4xiCLHV8IpIQ","level":6},{"id":"recfqLvN8H2ZHuolK","level":6},{"id":"recqkCYIBRlqH7IoT","level":6},{"id":"recMvKBYMz7qjPn5o","level":4},{"id":"recDXjekxwm1Nh77T","level":4},{"id":"recvalrsm02e63lw4","level":5},{"id":"recT17TO1XinYCD95","level":6},{"id":"recdj5xs1qIji4Ov1","level":5},{"id":"recPXUEpkQWNTNtIy","level":6},{"id":"rec1cPa44IY0W7opU","level":6},{"id":"recw2N2l25dhAvKEk","level":6}]',
      name: 'Pix+ Droit Acquis Pix - Avancé',
    },
    {
      scope: 'CappedTubes',
      threshold: 60,
      cappedTubes:
        '[{"id":"recUdaazeg9ab1x8","level":5},{"id":"rec1kppf5qSULXL88","level":5},{"id":"rec23TMwZJMWYrLLB","level":3},{"id":"rec1xrHLjM3wKKBQw","level":5},{"id":"rec1zfqGYUlb9kpc7","level":5},{"id":"rec1iJyutGqz908KP","level":5},{"id":"rec1yOOnDKBhlFQCI","level":5},{"id":"recOhQQlfrVd0BRi","level":5},{"id":"rec1kv8fMxTH78n3N","level":4},{"id":"rec1JqLswIdY95dN3","level":3},{"id":"rec2QhdQyHvT2cBj8","level":4},{"id":"rec1fXDQN6aZ0ViRG","level":4},{"id":"rec250gcsxlgbZn5X","level":4},{"id":"rec1HGzIiFxjlUxNB","level":4},{"id":"rec2UnGTFHI3r9X3X","level":5},{"id":"rec1rIR8Hclrsf0hl","level":4},{"id":"rec2wTqyy3zktkbxV","level":5},{"id":"rec2xdZagxRWcwDhV","level":3},{"id":"rec1UPUQezJx8za0f","level":5},{"id":"recX2jhH6LhKZEJ7","level":5},{"id":"rec1MpmrTmc1UCjQK","level":4},{"id":"rec2CYg3zJ9YgWgUb","level":4},{"id":"rec1F7qIWWrzF8Xw7","level":4},{"id":"rec1eOLUhvXknmwpI","level":5},{"id":"rec2LMAxDvFwNtp0i","level":5},{"id":"rec1hjijhETLVEwzT","level":3},{"id":"rec2W69xY3ur09POW","level":4},{"id":"rec1qf3vKmtVpSxV5","level":5},{"id":"rec1hB329odC48vly","level":4},{"id":"reci4a7xQ6WHIS2Yj","level":5},{"id":"rec1EG7WD94hbrS0H","level":5},{"id":"rec2jUsAg9mBoYvI2","level":4},{"id":"rec2FOwJDYa0MIkQC","level":5},{"id":"rec2ivYOe3ngcFkdj","level":4},{"id":"rec1xDldqZ9YxvCia","level":5},{"id":"rec1BJz3VsSR2Uisa","level":4},{"id":"rec1oMAncy43788q1","level":5},{"id":"rec1NzNK4W4H4pfoT","level":5},{"id":"rec1lNAycEstOUzJf","level":5},{"id":"rec1xvCPKkkX7AUe9","level":5},{"id":"recLpYKlAA1oFGLn","level":5},{"id":"rec1uICWmlljuT5V5","level":5},{"id":"rec2cpjZvMs9zvN5T","level":5},{"id":"recR24FjsvimWNmk","level":4},{"id":"rec2lwNCubUyn4heA","level":5}]',
      name: 'Pix+ Droit Droit - Avancé',
    },
    {
      scope: 'CappedTubes',
      threshold: 40,
      cappedTubes:
        '[{"id":"recUdaazeg9ab1x8","level":5},{"id":"rec1kppf5qSULXL88","level":5},{"id":"rec23TMwZJMWYrLLB","level":3},{"id":"rec1xrHLjM3wKKBQw","level":5},{"id":"rec1zfqGYUlb9kpc7","level":5},{"id":"rec1iJyutGqz908KP","level":5},{"id":"rec1yOOnDKBhlFQCI","level":5},{"id":"recOhQQlfrVd0BRi","level":5}]',
      name: 'Pix+ Droit Acquis D1 - Avancé',
    },
    {
      scope: 'CappedTubes',
      threshold: 40,
      cappedTubes:
        '[{"id":"rec1kv8fMxTH78n3N","level":4},{"id":"rec1JqLswIdY95dN3","level":3},{"id":"rec2QhdQyHvT2cBj8","level":4},{"id":"rec1fXDQN6aZ0ViRG","level":4},{"id":"rec250gcsxlgbZn5X","level":4},{"id":"rec1HGzIiFxjlUxNB","level":4},{"id":"rec2UnGTFHI3r9X3X","level":5},{"id":"rec1rIR8Hclrsf0hl","level":4}]',
      name: 'Pix+ Droit D2 Avancé',
    },
    {
      scope: 'CappedTubes',
      threshold: 40,
      cappedTubes:
        '[{"id":"rec2wTqyy3zktkbxV","level":5},{"id":"rec2xdZagxRWcwDhV","level":3},{"id":"rec1UPUQezJx8za0f","level":5},{"id":"recX2jhH6LhKZEJ7","level":5},{"id":"rec1MpmrTmc1UCjQK","level":4},{"id":"rec2CYg3zJ9YgWgUb","level":4},{"id":"rec1F7qIWWrzF8Xw7","level":4},{"id":"rec1eOLUhvXknmwpI","level":5},{"id":"rec2LMAxDvFwNtp0i","level":5},{"id":"rec1hjijhETLVEwzT","level":3},{"id":"rec2W69xY3ur09POW","level":4},{"id":"rec1qf3vKmtVpSxV5","level":5},{"id":"rec1hB329odC48vly","level":4},{"id":"reci4a7xQ6WHIS2Yj","level":5},{"id":"rec1EG7WD94hbrS0H","level":5},{"id":"rec2jUsAg9mBoYvI2","level":4},{"id":"rec2FOwJDYa0MIkQC","level":5}]',
      name: 'Pix+ Droit D3 - Avancé',
    },
    {
      scope: 'CappedTubes',
      threshold: 40,
      cappedTubes:
        '[{"id":"rec2ivYOe3ngcFkdj","level":4},{"id":"rec1xDldqZ9YxvCia","level":5},{"id":"rec1BJz3VsSR2Uisa","level":4},{"id":"rec1oMAncy43788q1","level":5},{"id":"rec1NzNK4W4H4pfoT","level":5},{"id":"rec1lNAycEstOUzJf","level":5},{"id":"rec1xvCPKkkX7AUe9","level":5},{"id":"recLpYKlAA1oFGLn","level":5},{"id":"rec1uICWmlljuT5V5","level":5},{"id":"rec2cpjZvMs9zvN5T","level":5},{"id":"recR24FjsvimWNmk","level":4},{"id":"rec2lwNCubUyn4heA","level":5}]',
      name: 'Pix+ Droit D4 - Avancé',
    },
  ].map(({ scope, threshold, cappedTubes, name }) => {
    databaseBuilder.factory.buildBadgeCriterion({
      badgeId: PIX_DROIT_AVANCE_CERTIFIABLE_BADGE_ID,
      scope,
      threshold,
      cappedTubes,
      name,
    });
  });

  databaseBuilder.factory.buildBadge({
    id: PIX_DROIT_EXPERT_CERTIFIABLE_BADGE_ID,
    targetProfileId: PIX_DROIT_TARGET_PROFILE_2_ID,
    message:
      "Félicitations ! Votre profil est prêt pour vous présenter à une certification Pix+Droit de niveau Expert. Les compétences numériques nécessaires à l'exercice des métiers du droit n'ont plus de secret pour vous.",
    altMessage: 'Pix+Droit niveau Expert',
    imageUrl: 'https://images.pix.fr/badges/badge_pix-PIX_DROIT_gold%20copy.svg',
    key: badges.keys.PIX_DROIT_EXPERT_CERTIF,
    title: 'Pix+Droit niveau Expert',
    isCertifiable: true,
    isAlwaysVisible: false,
  });

  [
    {
      scope: 'CappedTubes',
      threshold: 70,
      cappedTubes:
        '[{"id":"reccqGUKgzIOK8f9U","level":4},{"id":"rec4RO6t7qai3ODuJ","level":5},{"id":"recBbCIEKgrQi7eb6","level":6},{"id":"recsoZIZxVEr3h2og","level":5},{"id":"recYmSqXBdRWCbTL6","level":6},{"id":"recqjSAxTnNej5zSQ","level":6},{"id":"rec5D8oOcnSVc1wb5","level":6},{"id":"recPOjwrHFhM21yGE","level":5},{"id":"recpe7Y8Wq2D56q6I","level":7},{"id":"recYwQBNHPtwEIchq","level":4},{"id":"reco9L9TNFYvZ4Bt6","level":6},{"id":"recpQLhHdOTQAx6UL","level":7},{"id":"reckFeg9YextW6q9P","level":6},{"id":"recS1VZiU2ZNQEJey","level":6},{"id":"recIEuCfChJpc8UyH","level":6},{"id":"recjNL8mBDttF4lPC","level":4},{"id":"recqIeeEoWE0siJz8","level":4},{"id":"recl6FCNC8DBsclHV","level":4},{"id":"recfRTGX0vJNzhApQ","level":6},{"id":"recN4ik49NYTUUbVm","level":5},{"id":"recwanhWqP3VMPic1","level":5},{"id":"recps4jQoK8zCW5wI","level":5},{"id":"reczOjAWmveW8RSkv","level":6},{"id":"recnIng2Rdw0drI7N","level":4},{"id":"rec1gP2RFbGcAaKC3","level":5},{"id":"recxZXtOPOhkPh1lv","level":4},{"id":"recXz8qMNXvEwIPlO","level":5},{"id":"recMaijlrK3flRbBs","level":3},{"id":"recf4znvmRGaGBUNQ","level":5},{"id":"rec4rdlxGTmlbrNLb","level":6},{"id":"recy4WSQsbpvLjL1g","level":5},{"id":"recRRCalqd5y2CyVD","level":6},{"id":"recpcdzdxDsnCjXZ6","level":4},{"id":"recBYMZcjBilDqnq6","level":5},{"id":"recVpHG0NDURRRycg","level":5},{"id":"recyNCBKtjN1MN1mZ","level":5},{"id":"recBVgidqYpPfWMeu","level":4},{"id":"recb576QI4qODr9EQ","level":5},{"id":"recH9oeseHQA74aZJ","level":4},{"id":"recjVAjbPUINn8yws","level":4},{"id":"recZfuVlR27qVXcAt","level":4},{"id":"reco6VV9D3Zm0jHo9","level":5},{"id":"rec7xyIH2SyMeWh0Y","level":3},{"id":"recwTYcY432rb0SGA","level":5},{"id":"receqqprQt5h6k5mT","level":6},{"id":"recEC0V9qBbLSqHhx","level":5},{"id":"recZuHNGEtpCbBPUD","level":5},{"id":"reciWLZDyQmXNn6lc","level":4},{"id":"recbH7WZIRE41pyVE","level":6},{"id":"rec1Z5gkirQNvtjrK","level":5},{"id":"recd3rYCdpWLtHXLk","level":6},{"id":"recTNeDmFIhhWQZi9","level":4},{"id":"recwDOoEMBYSmwF4H","level":3},{"id":"recHMYN8ZwOUX63ck","level":5},{"id":"recuvo92yAymf7l3r","level":5},{"id":"recFj3ODyi6whwFzk","level":3},{"id":"recwoTBW9eVqCl7Vd","level":5},{"id":"recGTIO2R0edgARcA","level":3},{"id":"recJmEjTV9NacUqZ8","level":5},{"id":"recgkzKSGhyw1Gwtz","level":6},{"id":"recIMsNGpsxv2GSCI","level":6},{"id":"rec38YpXqa8RtM1Yy","level":6},{"id":"recVyULQAf8zFXjCg","level":5},{"id":"recTVcQOH3zhL8h29","level":7},{"id":"recdd0tt0BaQxeSj5","level":6},{"id":"recgPVFxgVPDUkQWX","level":5},{"id":"reczBuVhH7fuC4u3k","level":6},{"id":"rec5hclRSqG7gpadZ","level":6},{"id":"recY3xrzPegD40fkO","level":5},{"id":"recPS09GOFlMbp6dF","level":5},{"id":"recdm5W4IJMW07SzW","level":4},{"id":"recf0RoWlVKSMke8l","level":6},{"id":"recgrxoIilcw9uj0U","level":5},{"id":"rec8lYF4iaCcI6Stl","level":6},{"id":"recpz9gZET6VJFeen","level":5},{"id":"recG7E3zypAJD3S05","level":5},{"id":"rece5w6NqPCDo87zS","level":4},{"id":"recYFCpGlmwQwAONl","level":5},{"id":"recpP9Uaz1x6qq95e","level":4},{"id":"rectTJBNUL6lz0sEJ","level":4},{"id":"rec1qBTb7CtGB0GmO","level":6},{"id":"recZOEoQzjBUQR9hw","level":5},{"id":"rechtUc7ZgECYIPJD","level":3},{"id":"rec2Vi2Bg4LdMmEjd","level":2},{"id":"recW9R9lBG3faLOzL","level":4},{"id":"recbz4xiCLHV8IpIQ","level":6},{"id":"recfqLvN8H2ZHuolK","level":6},{"id":"recqkCYIBRlqH7IoT","level":6},{"id":"recMvKBYMz7qjPn5o","level":4},{"id":"recDXjekxwm1Nh77T","level":4},{"id":"recvalrsm02e63lw4","level":5},{"id":"recT17TO1XinYCD95","level":6},{"id":"recdj5xs1qIji4Ov1","level":5},{"id":"recPXUEpkQWNTNtIy","level":6},{"id":"rec1cPa44IY0W7opU","level":6},{"id":"recw2N2l25dhAvKEk","level":6}]',
      name: 'Pix+ Droit Pix - Expert',
    },
    {
      scope: 'CappedTubes',
      threshold: 80,
      cappedTubes:
        '[{"id":"recUdaazeg9ab1x8","level":5},{"id":"rec1kppf5qSULXL88","level":5},{"id":"rec23TMwZJMWYrLLB","level":3},{"id":"rec1xrHLjM3wKKBQw","level":5},{"id":"rec1zfqGYUlb9kpc7","level":5},{"id":"rec1iJyutGqz908KP","level":5},{"id":"rec1yOOnDKBhlFQCI","level":5},{"id":"recOhQQlfrVd0BRi","level":5},{"id":"rec1kv8fMxTH78n3N","level":4},{"id":"rec1JqLswIdY95dN3","level":3},{"id":"rec2QhdQyHvT2cBj8","level":4},{"id":"rec1fXDQN6aZ0ViRG","level":4},{"id":"rec250gcsxlgbZn5X","level":4},{"id":"rec1HGzIiFxjlUxNB","level":4},{"id":"rec2UnGTFHI3r9X3X","level":5},{"id":"rec1rIR8Hclrsf0hl","level":4},{"id":"rec2wTqyy3zktkbxV","level":5},{"id":"rec2xdZagxRWcwDhV","level":3},{"id":"rec1UPUQezJx8za0f","level":5},{"id":"recX2jhH6LhKZEJ7","level":5},{"id":"rec1MpmrTmc1UCjQK","level":4},{"id":"rec2CYg3zJ9YgWgUb","level":4},{"id":"rec1F7qIWWrzF8Xw7","level":4},{"id":"rec1eOLUhvXknmwpI","level":5},{"id":"rec2LMAxDvFwNtp0i","level":5},{"id":"rec1hjijhETLVEwzT","level":3},{"id":"rec2W69xY3ur09POW","level":4},{"id":"rec1qf3vKmtVpSxV5","level":5},{"id":"rec1hB329odC48vly","level":4},{"id":"reci4a7xQ6WHIS2Yj","level":5},{"id":"rec1EG7WD94hbrS0H","level":5},{"id":"rec2jUsAg9mBoYvI2","level":4},{"id":"rec2FOwJDYa0MIkQC","level":5},{"id":"rec2ivYOe3ngcFkdj","level":4},{"id":"rec1xDldqZ9YxvCia","level":5},{"id":"rec1BJz3VsSR2Uisa","level":4},{"id":"rec1oMAncy43788q1","level":5},{"id":"rec1NzNK4W4H4pfoT","level":5},{"id":"rec1lNAycEstOUzJf","level":5},{"id":"rec1xvCPKkkX7AUe9","level":5},{"id":"recLpYKlAA1oFGLn","level":5},{"id":"rec1uICWmlljuT5V5","level":5},{"id":"rec2cpjZvMs9zvN5T","level":5},{"id":"recR24FjsvimWNmk","level":4},{"id":"rec2lwNCubUyn4heA","level":5}]',
      name: 'Pix+ Droit Droit - Expert',
    },
  ].map(({ scope, threshold, cappedTubes, name }) => {
    databaseBuilder.factory.buildBadgeCriterion({
      badgeId: PIX_DROIT_EXPERT_CERTIFIABLE_BADGE_ID,
      scope,
      threshold,
      cappedTubes,
      name,
    });
  });

  databaseBuilder.factory.buildBadge({
    id: PIX_DROIT_INITIE_CERTIFIABLE_BADGE_ID,
    targetProfileId: PIX_DROIT_TARGET_PROFILE_ID,
    message:
      "Félicitations ! Votre profil est prêt pour vous présenter à une certification Pix+Droit de niveau Initié. Vous avez fait preuve d'une maîtrise des compétences numériques nécessaires à l'exercice des métiers du droit dans tous les domaines. En perfectionnant encore vos compétences, vous pourrez obtenir un niveau Avancé.",
    altMessage: 'Pix+Droit niveau Initié',
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Droit- Pret-certif_Bronze--Initie.svg',
    key: badges.keys.PIX_DROIT_INITIE_CERTIF,
    title: 'Pix+Droit niveau Initié',
    isCertifiable: true,
    isAlwaysVisible: false,
  });

  [
    {
      scope: 'CappedTubes',
      threshold: 40,
      cappedTubes:
        '[{"id":"rec1xDldqZ9YxvCia","level":8},{"id":"rec1BJz3VsSR2Uisa","level":8},{"id":"rec2ivYOe3ngcFkdj","level":8},{"id":"rec1oMAncy43788q1","level":8},{"id":"rec1uICWmlljuT5V5","level":8},{"id":"recLpYKlAA1oFGLn","level":8},{"id":"rec1xvCPKkkX7AUe9","level":8},{"id":"rec1NzNK4W4H4pfoT","level":8},{"id":"rec1lNAycEstOUzJf","level":8},{"id":"rec2cpjZvMs9zvN5T","level":8},{"id":"recR24FjsvimWNmk","level":8},{"id":"rec2lwNCubUyn4heA","level":8}]',
      name: 'Pix+ Droit Acquis D4 - Initie',
    },
    {
      scope: 'CappedTubes',
      threshold: 70,
      cappedTubes:
        '[{"id":"recdj5xs1qIji4Ov1","level":8},{"id":"recw2N2l25dhAvKEk","level":8},{"id":"recPXUEpkQWNTNtIy","level":8},{"id":"rec1cPa44IY0W7opU","level":8},{"id":"recMaijlrK3flRbBs","level":8},{"id":"recf4znvmRGaGBUNQ","level":8},{"id":"rec4rdlxGTmlbrNLb","level":8},{"id":"recy4WSQsbpvLjL1g","level":8},{"id":"recyNCBKtjN1MN1mZ","level":8},{"id":"recpcdzdxDsnCjXZ6","level":8},{"id":"recBYMZcjBilDqnq6","level":8},{"id":"recRRCalqd5y2CyVD","level":8},{"id":"recVpHG0NDURRRycg","level":8},{"id":"recBVgidqYpPfWMeu","level":8},{"id":"recTNeDmFIhhWQZi9","level":8},{"id":"recHMYN8ZwOUX63ck","level":8},{"id":"recJmEjTV9NacUqZ8","level":8},{"id":"recwDOoEMBYSmwF4H","level":8},{"id":"recuvo92yAymf7l3r","level":8},{"id":"recFj3ODyi6whwFzk","level":8},{"id":"recwoTBW9eVqCl7Vd","level":8},{"id":"recGTIO2R0edgARcA","level":8},{"id":"recZfuVlR27qVXcAt","level":8},{"id":"reco6VV9D3Zm0jHo9","level":8},{"id":"recb576QI4qODr9EQ","level":8},{"id":"receqqprQt5h6k5mT","level":8},{"id":"recH9oeseHQA74aZJ","level":8},{"id":"recjVAjbPUINn8yws","level":8},{"id":"recwTYcY432rb0SGA","level":8},{"id":"rec7xyIH2SyMeWh0Y","level":8},{"id":"recEC0V9qBbLSqHhx","level":8},{"id":"recZuHNGEtpCbBPUD","level":8},{"id":"reciWLZDyQmXNn6lc","level":8},{"id":"recbH7WZIRE41pyVE","level":8},{"id":"rec1Z5gkirQNvtjrK","level":8},{"id":"recd3rYCdpWLtHXLk","level":8},{"id":"recdd0tt0BaQxeSj5","level":8},{"id":"recIMsNGpsxv2GSCI","level":8},{"id":"recgkzKSGhyw1Gwtz","level":8},{"id":"rec38YpXqa8RtM1Yy","level":8},{"id":"recTVcQOH3zhL8h29","level":8},{"id":"recVyULQAf8zFXjCg","level":8},{"id":"reczBuVhH7fuC4u3k","level":8},{"id":"recY3xrzPegD40fkO","level":8},{"id":"recPS09GOFlMbp6dF","level":8},{"id":"recgPVFxgVPDUkQWX","level":8},{"id":"rec5hclRSqG7gpadZ","level":8},{"id":"recdm5W4IJMW07SzW","level":8},{"id":"recf0RoWlVKSMke8l","level":8},{"id":"recgrxoIilcw9uj0U","level":8},{"id":"recpz9gZET6VJFeen","level":8},{"id":"rece5w6NqPCDo87zS","level":8},{"id":"recpP9Uaz1x6qq95e","level":8},{"id":"rec8lYF4iaCcI6Stl","level":8},{"id":"recYFCpGlmwQwAONl","level":8},{"id":"recG7E3zypAJD3S05","level":8},{"id":"recT17TO1XinYCD95","level":8},{"id":"recvalrsm02e63lw4","level":8},{"id":"recMvKBYMz7qjPn5o","level":8},{"id":"recDXjekxwm1Nh77T","level":8},{"id":"recZOEoQzjBUQR9hw","level":8},{"id":"rechtUc7ZgECYIPJD","level":8},{"id":"rec2Vi2Bg4LdMmEjd","level":8},{"id":"rec1qBTb7CtGB0GmO","level":8},{"id":"recW9R9lBG3faLOzL","level":8},{"id":"rectTJBNUL6lz0sEJ","level":8},{"id":"recbz4xiCLHV8IpIQ","level":8},{"id":"recfqLvN8H2ZHuolK","level":8},{"id":"recqkCYIBRlqH7IoT","level":8},{"id":"recfRTGX0vJNzhApQ","level":8},{"id":"recwanhWqP3VMPic1","level":8},{"id":"recnIng2Rdw0drI7N","level":8},{"id":"rec1gP2RFbGcAaKC3","level":8},{"id":"recN4ik49NYTUUbVm","level":8},{"id":"reczOjAWmveW8RSkv","level":8},{"id":"recl6FCNC8DBsclHV","level":8},{"id":"recXz8qMNXvEwIPlO","level":8},{"id":"recxZXtOPOhkPh1lv","level":8},{"id":"recps4jQoK8zCW5wI","level":8},{"id":"recjNL8mBDttF4lPC","level":8},{"id":"recqIeeEoWE0siJz8","level":8},{"id":"reco9L9TNFYvZ4Bt6","level":8},{"id":"recS1VZiU2ZNQEJey","level":8},{"id":"recpQLhHdOTQAx6UL","level":8},{"id":"reckFeg9YextW6q9P","level":8},{"id":"recIEuCfChJpc8UyH","level":8},{"id":"rec4RO6t7qai3ODuJ","level":8},{"id":"recsoZIZxVEr3h2og","level":8},{"id":"recYmSqXBdRWCbTL6","level":8},{"id":"recqjSAxTnNej5zSQ","level":8},{"id":"rec5D8oOcnSVc1wb5","level":8},{"id":"recYwQBNHPtwEIchq","level":8},{"id":"reccqGUKgzIOK8f9U","level":8},{"id":"recBbCIEKgrQi7eb6","level":8},{"id":"recpe7Y8Wq2D56q6I","level":8},{"id":"recPOjwrHFhM21yGE","level":8}]',
      name: 'Pix+ Droit Acquis Pix - Initie',
    },
    {
      scope: 'CappedTubes',
      threshold: 50,
      cappedTubes:
        '[{"id":"rec2UnGTFHI3r9X3X","level":8},{"id":"rec1rIR8Hclrsf0hl","level":8},{"id":"rec2QhdQyHvT2cBj8","level":8},{"id":"rec1JqLswIdY95dN3","level":8},{"id":"rec1kv8fMxTH78n3N","level":8},{"id":"rec250gcsxlgbZn5X","level":8},{"id":"rec1HGzIiFxjlUxNB","level":8},{"id":"rec1fXDQN6aZ0ViRG","level":8},{"id":"rec2LMAxDvFwNtp0i","level":8},{"id":"rec2W69xY3ur09POW","level":8},{"id":"rec1hjijhETLVEwzT","level":8},{"id":"rec1eOLUhvXknmwpI","level":8},{"id":"rec2CYg3zJ9YgWgUb","level":8},{"id":"rec1F7qIWWrzF8Xw7","level":8},{"id":"rec1MpmrTmc1UCjQK","level":8},{"id":"recX2jhH6LhKZEJ7","level":8},{"id":"rec2wTqyy3zktkbxV","level":8},{"id":"rec1UPUQezJx8za0f","level":8},{"id":"rec2xdZagxRWcwDhV","level":8},{"id":"rec2jUsAg9mBoYvI2","level":8},{"id":"rec1qf3vKmtVpSxV5","level":8},{"id":"rec1EG7WD94hbrS0H","level":8},{"id":"rec2FOwJDYa0MIkQC","level":8},{"id":"reci4a7xQ6WHIS2Yj","level":8},{"id":"rec1hB329odC48vly","level":8},{"id":"rec1xrHLjM3wKKBQw","level":8},{"id":"rec1zfqGYUlb9kpc7","level":8},{"id":"rec1yOOnDKBhlFQCI","level":8},{"id":"rec1iJyutGqz908KP","level":8},{"id":"recOhQQlfrVd0BRi","level":8},{"id":"rec1kppf5qSULXL88","level":8},{"id":"rec23TMwZJMWYrLLB","level":8},{"id":"recUdaazeg9ab1x8","level":8},{"id":"rec1xDldqZ9YxvCia","level":8},{"id":"rec1BJz3VsSR2Uisa","level":8},{"id":"rec2ivYOe3ngcFkdj","level":8},{"id":"rec1oMAncy43788q1","level":8},{"id":"rec1uICWmlljuT5V5","level":8},{"id":"recLpYKlAA1oFGLn","level":8},{"id":"rec1xvCPKkkX7AUe9","level":8},{"id":"rec1NzNK4W4H4pfoT","level":8},{"id":"rec1lNAycEstOUzJf","level":8},{"id":"rec2cpjZvMs9zvN5T","level":8},{"id":"recR24FjsvimWNmk","level":8},{"id":"rec2lwNCubUyn4heA","level":8}]',
      name: 'Pix+ Droit Droit - Initie',
    },
    {
      scope: 'CappedTubes',
      threshold: 40,
      cappedTubes:
        '[{"id":"rec1xrHLjM3wKKBQw","level":8},{"id":"rec1zfqGYUlb9kpc7","level":8},{"id":"rec1yOOnDKBhlFQCI","level":8},{"id":"rec1iJyutGqz908KP","level":8},{"id":"recOhQQlfrVd0BRi","level":8},{"id":"rec1kppf5qSULXL88","level":8},{"id":"rec23TMwZJMWYrLLB","level":8},{"id":"recUdaazeg9ab1x8","level":8}]',
      name: 'Pix+ Droit Acquis D1 - Initie',
    },
    {
      scope: 'CappedTubes',
      threshold: 40,
      cappedTubes:
        '[{"id":"rec2UnGTFHI3r9X3X","level":8},{"id":"rec1rIR8Hclrsf0hl","level":8},{"id":"rec2QhdQyHvT2cBj8","level":8},{"id":"rec1JqLswIdY95dN3","level":8},{"id":"rec1kv8fMxTH78n3N","level":8},{"id":"rec250gcsxlgbZn5X","level":8},{"id":"rec1HGzIiFxjlUxNB","level":8},{"id":"rec1fXDQN6aZ0ViRG","level":8}]',
      name: 'Pix+ Droit Acquis D2 - Initie',
    },
    {
      scope: 'CappedTubes',
      threshold: 40,
      cappedTubes:
        '[{"id":"rec2LMAxDvFwNtp0i","level":8},{"id":"rec2W69xY3ur09POW","level":8},{"id":"rec1hjijhETLVEwzT","level":8},{"id":"rec1eOLUhvXknmwpI","level":8},{"id":"rec2CYg3zJ9YgWgUb","level":8},{"id":"rec1F7qIWWrzF8Xw7","level":8},{"id":"rec1MpmrTmc1UCjQK","level":8},{"id":"recX2jhH6LhKZEJ7","level":8},{"id":"rec2wTqyy3zktkbxV","level":8},{"id":"rec1UPUQezJx8za0f","level":8},{"id":"rec2xdZagxRWcwDhV","level":8},{"id":"rec2jUsAg9mBoYvI2","level":8},{"id":"rec1qf3vKmtVpSxV5","level":8},{"id":"rec1EG7WD94hbrS0H","level":8},{"id":"rec2FOwJDYa0MIkQC","level":8},{"id":"reci4a7xQ6WHIS2Yj","level":8},{"id":"rec1hB329odC48vly","level":8}]',
      name: 'Pix+ Droit Acquis D3 - Initie',
    },
  ].map(({ scope, threshold, cappedTubes, name }) => {
    databaseBuilder.factory.buildBadgeCriterion({
      badgeId: PIX_DROIT_INITIE_CERTIFIABLE_BADGE_ID,
      scope,
      threshold,
      cappedTubes,
      name,
    });
  });

  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: PIX_DROIT_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
    badgeId: PIX_DROIT_INITIE_CERTIFIABLE_BADGE_ID,
    complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
    level: 1,
    imageUrl: 'https://images.pix.fr/badges-certifies/pix-droit/initie.svg',
    label: 'Pix+ Droit Initié',
    certificateMessage: null,
    temporaryCertificateMessage: null,
    stickerUrl: 'https://images.pix.fr/stickers/macaron_droit_initie.pdf',
  });
}

function _createPixEdu1erDegre(databaseBuilder) {
  databaseBuilder.factory.buildComplementaryCertification.pixEdu1erDegre({
    id: PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
  });
  databaseBuilder.factory.buildTargetProfile({
    id: PIX_EDU_1ER_DEGRE_FI_TARGET_PROFILE_ID,
    imageUrl: null,
    description: null,
    name: '[Pix+Édu 1D FI] Prêt pour la certification du volet 1',
    isSimplifiedAccess: false,
    areKnowledgeElementsResettable: true,
    category: 'PREDEFINED',
    isPublic: true,
    ownerOrganizationId: PRO_ORGANIZATION_ID,
  });
  databaseBuilder.factory.buildTargetProfile({
    id: PIX_EDU_1ER_DEGRE_FC_TARGET_PROFILE_ID,
    imageUrl: null,
    description: null,
    name: '[Pix+Édu 1D FC] Prêt pour la certification du volet 1',
    isSimplifiedAccess: false,
    category: 'PREDEFINED',
    isPublic: true,
    ownerOrganizationId: PRO_ORGANIZATION_ID,
  });
  [
    { tubeId: 'rec5D8oOcnSVc1wb5', level: 6 },
    { tubeId: 'recS1VZiU2ZNQEJey', level: 6 },
    { tubeId: 'recFj3ODyi6whwFzk', level: 3 },
    { tubeId: 'recy4WSQsbpvLjL1g', level: 5 },
    { tubeId: 'recfRTGX0vJNzhApQ', level: 6 },
    { tubeId: 'recvh9JpYxpq3RDdD', level: 5 },
    { tubeId: 'rec1oD4DBP8UIXzSR', level: 3 },
    { tubeId: 'recWYmbh7BF8BNj4', level: 4 },
    { tubeId: 'rec2LvRgMZNGPbSKs', level: 4 },
    { tubeId: 'rec1S5JJUERpVhoYn', level: 2 },
    { tubeId: 'rec28mkBzkQlNxsU4', level: 5 },
    { tubeId: 'recsoZIZxVEr3h2og', level: 5 },
    { tubeId: 'rec2fpugR3auJLwcH', level: 4 },
    { tubeId: 'rec2CFQNcZNEpr6jk', level: 3 },
    { tubeId: 'recCTEeJefuFO1Pjy', level: 5 },
    { tubeId: 'rec2Vi2Bg4LdMmEjd', level: 4 },
    { tubeId: 'recLtN5zlea2WhR6', level: 3 },
    { tubeId: 'recPtX9sny8yBBvn', level: 4 },
    { tubeId: 'rece5w6NqPCDo87zS', level: 4 },
    { tubeId: 'rec18Fli7IwDRdxUM', level: 2 },
    { tubeId: 'rec1BYw6lxKdlGoPA', level: 2 },
    { tubeId: 'rec1Y7stSsdwX4tkM', level: 3 },
    { tubeId: 'recVpgUtxW3xx5Pu', level: 6 },
    { tubeId: 'rec2cFYduLeErwNQE', level: 5 },
    { tubeId: 'rec23QiLTJkPc7Sk1', level: 2 },
    { tubeId: 'recYmSqXBdRWCbTL6', level: 6 },
    { tubeId: 'recPUBbe8eBDIpJH', level: 2 },
    { tubeId: 'rec1gP2RFbGcAaKC3', level: 5 },
    { tubeId: 'recDXjekxwm1Nh77T', level: 4 },
    { tubeId: 'rec4RO6t7qai3ODuJ', level: 5 },
    { tubeId: 'recoPAkxe29Ru3r3h', level: 6 },
    { tubeId: 'rec2mSskzOmeuvu5x', level: 3 },
    { tubeId: 'reczBuVhH7fuC4u3k', level: 5 },
    { tubeId: 'recZOEoQzjBUQR9hw', level: 5 },
    { tubeId: 'recnK0Dzr3R9NGG12', level: 5 },
    { tubeId: 'recZfuVlR27qVXcAt', level: 4 },
    { tubeId: 'rectTJBNUL6lz0sEJ', level: 5 },
    { tubeId: 'recb576QI4qODr9EQ', level: 6 },
    { tubeId: 'recW9R9lBG3faLOzL', level: 4 },
    { tubeId: 'recIEuCfChJpc8UyH', level: 6 },
    { tubeId: 'recVpHG0NDURRRycg', level: 5 },
    { tubeId: 'recO7LXR9gQ2TOiDd', level: 3 },
    { tubeId: 'reccqGUKgzIOK8f9U', level: 4 },
    { tubeId: 'recFqgr6NInvODwkw', level: 3 },
    { tubeId: 'rec1Z5gkirQNvtjrK', level: 5 },
    { tubeId: 'recqjSAxTnNej5zSQ', level: 6 },
    { tubeId: 'recYFCpGlmwQwAONl', level: 5 },
    { tubeId: 'recY3xrzPegD40fkO', level: 5 },
    { tubeId: 'rec5hclRSqG7gpadZ', level: 5 },
    { tubeId: 'rec38YpXqa8RtM1Yy', level: 6 },
    { tubeId: 'recpz9gZET6VJFeen', level: 5 },
    { tubeId: 'recghgiH1DlfS0vv4', level: 5 },
    { tubeId: 'recEC0V9qBbLSqHhx', level: 5 },
    { tubeId: 'recf0RoWlVKSMke8l', level: 6 },
    { tubeId: 'reczVXRbD2PcCcfgf', level: 5 },
    { tubeId: 'recpe7Y8Wq2D56q6I', level: 6 },
    { tubeId: 'recd3rYCdpWLtHXLk', level: 6 },
    { tubeId: 'recwoTBW9eVqCl7Vd', level: 5 },
    { tubeId: 'recyNCBKtjN1MN1mZ', level: 5 },
    { tubeId: 'rec8lYF4iaCcI6Stl', level: 5 },
    { tubeId: 'reczOjAWmveW8RSkv', level: 6 },
    { tubeId: 'recMvKBYMz7qjPn5o', level: 4 },
    { tubeId: 'recdd0tt0BaQxeSj5', level: 6 },
    { tubeId: 'recJmEjTV9NacUqZ8', level: 5 },
    { tubeId: 'recprH1OzWoAgWvw9', level: 5 },
    { tubeId: 'recTVcQOH3zhL8h29', level: 6 },
    { tubeId: 'recbjdy2SrgCRVBNu', level: 4 },
    { tubeId: 'recwanhWqP3VMPic1', level: 5 },
    { tubeId: 'recgkzKSGhyw1Gwtz', level: 6 },
    { tubeId: 'recvalrsm02e63lw4', level: 5 },
    { tubeId: 'recgrxoIilcw9uj0U', level: 5 },
    { tubeId: 'recgPVFxgVPDUkQWX', level: 5 },
    { tubeId: 'recEC92AOM3EAcse6', level: 4 },
    { tubeId: 'recf4znvmRGaGBUNQ', level: 5 },
    { tubeId: 'rectOrHRTau047Kyc', level: 3 },
    { tubeId: 'recHcnhCd60Uq4APj', level: 5 },
    { tubeId: 'reco9L9TNFYvZ4Bt6', level: 6 },
    { tubeId: 'rec53o75CXpVN1soh', level: 4 },
    { tubeId: 'recZuHNGEtpCbBPUD', level: 5 },
    { tubeId: 'recPOjwrHFhM21yGE', level: 5 },
    { tubeId: 'recIMsNGpsxv2GSCI', level: 6 },
    { tubeId: 'rec1upvYVZyTbJJ4J', level: 3 },
    { tubeId: 'recYwQBNHPtwEIchq', level: 4 },
    { tubeId: 'recbH7WZIRE41pyVE', level: 6 },
    { tubeId: 'recx9VucrG4p7FAOO', level: 4 },
    { tubeId: 'recwTYcY432rb0SGA', level: 5 },
    { tubeId: 'recLjGqbXq7Utibkb', level: 4 },
    { tubeId: 'recPXUEpkQWNTNtIy', level: 6 },
    { tubeId: 'recVyULQAf8zFXjCg', level: 5 },
    { tubeId: 'recN4ik49NYTUUbVm', level: 5 },
    { tubeId: 'recGTIO2R0edgARcA', level: 3 },
    { tubeId: 'recl6FCNC8DBsclHV', level: 4 },
    { tubeId: 'recps4jQoK8zCW5wI', level: 5 },
    { tubeId: 'recRRCalqd5y2CyVD', level: 6 },
    { tubeId: 'recTNeDmFIhhWQZi9', level: 4 },
    { tubeId: 'recBbCIEKgrQi7eb6', level: 6 },
    { tubeId: 'recXz8qMNXvEwIPlO', level: 5 },
    { tubeId: 'recpnZGFdYz0siz9O', level: 5 },
    { tubeId: 'tube28291WoQhI8rLB', level: 2 },
    { tubeId: 'tube1weUWgKFzDS1f6', level: 2 },
    { tubeId: 'tube2fIwLdAvLkk5nK', level: 2 },
    { tubeId: 'tube1UYqjflF0Pm6Ny', level: 4 },
    { tubeId: 'tube1xnoVru2aOYLRF', level: 2 },
    { tubeId: 'tube29I1zg5tzEQU0H', level: 2 },
    { tubeId: 'tube1Jgpwmj8j4OMYb', level: 4 },
    { tubeId: 'tubeWKfoLk9Mlg0O0', level: 2 },
    { tubeId: 'tube28coNkBrSHdW34', level: 2 },
    { tubeId: 'rec2fyFEOv1ef9iOY', level: 2 },
    { tubeId: 'recpP9Uaz1x6qq95e', level: 4 },
    { tubeId: 'tube1vZZM0oflmZWvU', level: 2 },
    { tubeId: 'recT17TO1XinYCD95', level: 6 },
    { tubeId: 'tube25jNBqolYB8V2r', level: 3 },
    { tubeId: 'tube2l7fFnDh1vPn4s', level: 5 },
    { tubeId: 'tube1NLpOetQhutFlA', level: 2 },
    { tubeId: 'tube1fUwkP4nkSMt3H', level: 2 },
    { tubeId: 'tube1TzWCkSfVTOTIA', level: 2 },
    { tubeId: 'tube1hzZBLOmWp9KoP', level: 3 },
    { tubeId: 'tubeL9gPGU3vgfGuC', level: 2 },
    { tubeId: 'tube2x5v8i5gRE3inE', level: 1 },
    { tubeId: 'tube15ybmhs2qK2vYd', level: 3 },
    { tubeId: 'tube1ggNIZJYHY4sxA', level: 2 },
    { tubeId: 'tube26F5w4J602048x', level: 1 },
  ].map(({ tubeId, level }) => {
    databaseBuilder.factory.buildTargetProfileTube({
      targetProfileId: PIX_EDU_1ER_DEGRE_FI_TARGET_PROFILE_ID,
      tubeId,
      level,
    });
    databaseBuilder.factory.buildTargetProfileTube({
      targetProfileId: PIX_EDU_1ER_DEGRE_FC_TARGET_PROFILE_ID,
      tubeId,
      level,
    });
  });

  databaseBuilder.factory.buildBadge({
    id: PIX_EDU_1ER_DEGRE_FI_INITIE_CERTIFIABLE_BADGE_ID,
    targetProfileId: PIX_EDU_1ER_DEGRE_FI_TARGET_PROFILE_ID,
    message:
      'Félicitations ! Votre profil est prêt pour vous présenter à une certification Pix+Édu de niveau Initié (entrée dans le métier).',
    altMessage: 'Pix+Édu FI niveau Initié (entrée dans le métier)',
    key: badges.keys.PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-Initie-PREMIER-DEGRE.svg',
    title: 'Pix+Édu niveau Initié FI (entrée dans le métier)',
    isCertifiable: true,
    isAlwaysVisible: false,
  });

  databaseBuilder.factory.buildBadge({
    id: PIX_EDU_1ER_DEGRE_FC_CONFIRME_CERTIFIABLE_BADGE_ID,
    targetProfileId: PIX_EDU_1ER_DEGRE_FC_TARGET_PROFILE_ID,
    message:
      'Félicitations ! Votre profil est prêt pour vous présenter à une certification Pix+Édu de niveau Confirmé.',
    altMessage: 'Pix+Édu FC niveau Confirmé',
    key: badges.keys.PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-confirme_PREMIER-DEGRE.svg',
    title: 'Pix+Édu FC niveau Confirmé',
    isCertifiable: true,
    isAlwaysVisible: false,
  });

  [
    {
      scope: 'CappedTubes',
      threshold: 50,
      cappedTubes:
        '[{"id":"recPOjwrHFhM21yGE","level":5},{"id":"recpe7Y8Wq2D56q6I","level":6},{"id":"recBbCIEKgrQi7eb6","level":6},{"id":"reccqGUKgzIOK8f9U","level":4},{"id":"rec4RO6t7qai3ODuJ","level":5},{"id":"recsoZIZxVEr3h2og","level":5},{"id":"recYmSqXBdRWCbTL6","level":6},{"id":"rec5D8oOcnSVc1wb5","level":6},{"id":"recqjSAxTnNej5zSQ","level":6},{"id":"recYwQBNHPtwEIchq","level":4},{"id":"recfRTGX0vJNzhApQ","level":6},{"id":"recwanhWqP3VMPic1","level":5},{"id":"rec1gP2RFbGcAaKC3","level":5},{"id":"recN4ik49NYTUUbVm","level":5},{"id":"reczOjAWmveW8RSkv","level":6},{"id":"recXz8qMNXvEwIPlO","level":5},{"id":"recl6FCNC8DBsclHV","level":4},{"id":"recps4jQoK8zCW5wI","level":5},{"id":"reco9L9TNFYvZ4Bt6","level":6},{"id":"recS1VZiU2ZNQEJey","level":6},{"id":"recghgiH1DlfS0vv4","level":5},{"id":"recIEuCfChJpc8UyH","level":6},{"id":"recbjdy2SrgCRVBNu","level":4},{"id":"tube1UYqjflF0Pm6Ny","level":4},{"id":"recf4znvmRGaGBUNQ","level":5},{"id":"recy4WSQsbpvLjL1g","level":5},{"id":"recyNCBKtjN1MN1mZ","level":5},{"id":"recRRCalqd5y2CyVD","level":6},{"id":"recVpHG0NDURRRycg","level":5},{"id":"recZfuVlR27qVXcAt","level":4},{"id":"recb576QI4qODr9EQ","level":6},{"id":"recEC0V9qBbLSqHhx","level":5},{"id":"recwTYcY432rb0SGA","level":5},{"id":"recZuHNGEtpCbBPUD","level":5},{"id":"rec28mkBzkQlNxsU4","level":5},{"id":"recVpgUtxW3xx5Pu","level":6},{"id":"rec2cFYduLeErwNQE","level":5},{"id":"recbH7WZIRE41pyVE","level":6},{"id":"rec1Z5gkirQNvtjrK","level":5},{"id":"recd3rYCdpWLtHXLk","level":6},{"id":"recTNeDmFIhhWQZi9","level":4},{"id":"recJmEjTV9NacUqZ8","level":5},{"id":"recFj3ODyi6whwFzk","level":3},{"id":"recwoTBW9eVqCl7Vd","level":5},{"id":"recGTIO2R0edgARcA","level":3},{"id":"reczBuVhH7fuC4u3k","level":5},{"id":"recY3xrzPegD40fkO","level":5},{"id":"rec2fpugR3auJLwcH","level":4},{"id":"recEC92AOM3EAcse6","level":4},{"id":"recgPVFxgVPDUkQWX","level":5},{"id":"rec5hclRSqG7gpadZ","level":5},{"id":"recf0RoWlVKSMke8l","level":6},{"id":"recLjGqbXq7Utibkb","level":4},{"id":"recpnZGFdYz0siz9O","level":5},{"id":"recnK0Dzr3R9NGG12","level":5},{"id":"reczVXRbD2PcCcfgf","level":5},{"id":"recCTEeJefuFO1Pjy","level":5},{"id":"recgkzKSGhyw1Gwtz","level":6},{"id":"rec38YpXqa8RtM1Yy","level":6},{"id":"recTVcQOH3zhL8h29","level":6},{"id":"recx9VucrG4p7FAOO","level":4},{"id":"recprH1OzWoAgWvw9","level":5},{"id":"recIMsNGpsxv2GSCI","level":6},{"id":"recdd0tt0BaQxeSj5","level":6},{"id":"recVyULQAf8zFXjCg","level":5},{"id":"recFqgr6NInvODwkw","level":3},{"id":"recvh9JpYxpq3RDdD","level":5},{"id":"recHcnhCd60Uq4APj","level":5},{"id":"recgrxoIilcw9uj0U","level":5},{"id":"recpz9gZET6VJFeen","level":5},{"id":"rece5w6NqPCDo87zS","level":4},{"id":"rec2LvRgMZNGPbSKs","level":4},{"id":"recPtX9sny8yBBvn","level":4},{"id":"recpP9Uaz1x6qq95e","level":4},{"id":"tube2l7fFnDh1vPn4s","level":5},{"id":"rec8lYF4iaCcI6Stl","level":5},{"id":"recYFCpGlmwQwAONl","level":5},{"id":"recW9R9lBG3faLOzL","level":4},{"id":"recZOEoQzjBUQR9hw","level":5},{"id":"rec2Vi2Bg4LdMmEjd","level":4},{"id":"rectTJBNUL6lz0sEJ","level":5},{"id":"recMvKBYMz7qjPn5o","level":4},{"id":"recDXjekxwm1Nh77T","level":4},{"id":"recT17TO1XinYCD95","level":6},{"id":"recO7LXR9gQ2TOiDd","level":3},{"id":"recvalrsm02e63lw4","level":5},{"id":"rectOrHRTau047Kyc","level":3},{"id":"rec53o75CXpVN1soh","level":4},{"id":"recPXUEpkQWNTNtIy","level":6},{"id":"recoPAkxe29Ru3r3h","level":6},{"id":"rec18Fli7IwDRdxUM","level":2},{"id":"recLtN5zlea2WhR6","level":3},{"id":"tube2fIwLdAvLkk5nK","level":2},{"id":"rec1Y7stSsdwX4tkM","level":3},{"id":"rec2fyFEOv1ef9iOY","level":2},{"id":"rec1S5JJUERpVhoYn","level":2},{"id":"rec1upvYVZyTbJJ4J","level":3},{"id":"tube1NLpOetQhutFlA","level":2},{"id":"tubeWKfoLk9Mlg0O0","level":2},{"id":"recWYmbh7BF8BNj4","level":4},{"id":"recPUBbe8eBDIpJH","level":2},{"id":"rec23QiLTJkPc7Sk1","level":2},{"id":"tube25jNBqolYB8V2r","level":3},{"id":"rec2CFQNcZNEpr6jk","level":3},{"id":"rec2mSskzOmeuvu5x","level":3},{"id":"rec1oD4DBP8UIXzSR","level":3},{"id":"rec1BYw6lxKdlGoPA","level":2},{"id":"tube26F5w4J602048x","level":1},{"id":"tube1vZZM0oflmZWvU","level":2},{"id":"tube1hzZBLOmWp9KoP","level":3},{"id":"tube1weUWgKFzDS1f6","level":2},{"id":"tube1Jgpwmj8j4OMYb","level":4},{"id":"tube1fUwkP4nkSMt3H","level":2},{"id":"tube28coNkBrSHdW34","level":2},{"id":"tubeL9gPGU3vgfGuC","level":2},{"id":"tube1ggNIZJYHY4sxA","level":2},{"id":"tube29I1zg5tzEQU0H","level":2},{"id":"tube28291WoQhI8rLB","level":2},{"id":"tube1xnoVru2aOYLRF","level":2},{"id":"tube15ybmhs2qK2vYd","level":3},{"id":"tube2x5v8i5gRE3inE","level":1},{"id":"tube1TzWCkSfVTOTIA","level":2}]',
      name: '[Pix+Édu] Parcours CRCN + CRCNÉ',
    },
    {
      scope: 'CappedTubes',
      threshold: 50,
      cappedTubes:
        '[{"id":"rec18Fli7IwDRdxUM","level":2},{"id":"recLtN5zlea2WhR6","level":3},{"id":"tube2fIwLdAvLkk5nK","level":2},{"id":"rec1Y7stSsdwX4tkM","level":3},{"id":"rec2fyFEOv1ef9iOY","level":2},{"id":"rec1S5JJUERpVhoYn","level":2},{"id":"rec1upvYVZyTbJJ4J","level":3},{"id":"tube1NLpOetQhutFlA","level":2},{"id":"tubeWKfoLk9Mlg0O0","level":2},{"id":"recWYmbh7BF8BNj4","level":4},{"id":"recPUBbe8eBDIpJH","level":2},{"id":"rec23QiLTJkPc7Sk1","level":2},{"id":"tube25jNBqolYB8V2r","level":3},{"id":"rec2CFQNcZNEpr6jk","level":3},{"id":"rec2mSskzOmeuvu5x","level":3},{"id":"rec1oD4DBP8UIXzSR","level":3},{"id":"rec1BYw6lxKdlGoPA","level":2},{"id":"tube26F5w4J602048x","level":1},{"id":"tube1vZZM0oflmZWvU","level":2},{"id":"tube1hzZBLOmWp9KoP","level":3},{"id":"tube1weUWgKFzDS1f6","level":2},{"id":"tube1Jgpwmj8j4OMYb","level":4},{"id":"tube1fUwkP4nkSMt3H","level":2},{"id":"tube28coNkBrSHdW34","level":2},{"id":"tubeL9gPGU3vgfGuC","level":2},{"id":"tube1ggNIZJYHY4sxA","level":2},{"id":"tube29I1zg5tzEQU0H","level":2},{"id":"tube28291WoQhI8rLB","level":2},{"id":"tube1xnoVru2aOYLRF","level":2},{"id":"tube15ybmhs2qK2vYd","level":3},{"id":"tube2x5v8i5gRE3inE","level":1},{"id":"tube1TzWCkSfVTOTIA","level":2}]',
      name: '[Pix+Édu 1er degré] Parcours CRCNÉ',
    },
  ].map(({ scope, threshold, cappedTubes, name }) => {
    databaseBuilder.factory.buildBadgeCriterion({
      badgeId: PIX_EDU_1ER_DEGRE_FI_INITIE_CERTIFIABLE_BADGE_ID,
      scope,
      threshold,
      cappedTubes,
      name,
    });
    databaseBuilder.factory.buildBadgeCriterion({
      badgeId: PIX_EDU_1ER_DEGRE_FC_CONFIRME_CERTIFIABLE_BADGE_ID,
      scope,
      threshold,
      cappedTubes,
      name,
    });
  });

  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: PIX_EDU_1ER_DEGRE_FI_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
    badgeId: PIX_EDU_1ER_DEGRE_FI_INITIE_CERTIFIABLE_BADGE_ID,
    complementaryCertificationId: PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    level: 1,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-Autonome_PREMIER-DEGRE.svg',
    label: 'Pix+ Édu FI 1er degré Initié (entrée dans le métier)',
    certificateMessage: 'Vous avez obtenu la certification Pix+Édu niveau “Initié (entrée dans le métier)”',
    temporaryCertificateMessage:
      'Vous avez obtenu le niveau “Initié (entrée dans le métier)” dans le cadre du volet 1 de la certification Pix+Édu. Votre niveau final sera déterminé à l’issue du volet 2',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_1er_initie.pdf',
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
  });

  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: PIX_EDU_1ER_DEGRE_FC_CONFIRME_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
    badgeId: PIX_EDU_1ER_DEGRE_FC_CONFIRME_CERTIFIABLE_BADGE_ID,
    complementaryCertificationId: PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    level: 1,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-confirme_PREMIER-DEGRE.svg',
    label: 'Pix+ Édu FC 1er degré Confirmé',
    certificateMessage: 'Vous avez obtenu la certification Pix+Édu niveau “Confirmé”',
    temporaryCertificateMessage:
      'Vous avez obtenu le niveau “Confirmé” dans le cadre du volet 1 de la certification Pix+Édu. Votre niveau final sera déterminé à l’issue du volet 2',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_1er_confirme.pdf',
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
  });

  databaseBuilder.factory.buildBadge({
    id: PIX_EDU_1ER_DEGRE_FI_CONFIRME_CERTIFIABLE_BADGE_ID,
    targetProfileId: PIX_EDU_1ER_DEGRE_FI_TARGET_PROFILE_ID,
    message:
      'Félicitations ! Votre profil est prêt pour vous présenter à une certification Pix+Édu de niveau Confirmé.',
    altMessage: 'Pix+Édu FI niveau Confirmé',
    key: badges.keys.PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-Confirme-PREMIER-DEGRE.svg',
    title: 'Pix+Édu niveau Confirmé',
    isCertifiable: true,
    isAlwaysVisible: false,
  });

  [
    {
      scope: 'CappedTubes',
      threshold: 60,
      cappedTubes:
        '[{"id":"recPOjwrHFhM21yGE","level":5},{"id":"recpe7Y8Wq2D56q6I","level":6},{"id":"recBbCIEKgrQi7eb6","level":6},{"id":"reccqGUKgzIOK8f9U","level":4},{"id":"rec4RO6t7qai3ODuJ","level":5},{"id":"recsoZIZxVEr3h2og","level":5},{"id":"recYmSqXBdRWCbTL6","level":6},{"id":"rec5D8oOcnSVc1wb5","level":6},{"id":"recqjSAxTnNej5zSQ","level":6},{"id":"recYwQBNHPtwEIchq","level":4},{"id":"recfRTGX0vJNzhApQ","level":6},{"id":"recwanhWqP3VMPic1","level":5},{"id":"rec1gP2RFbGcAaKC3","level":5},{"id":"recN4ik49NYTUUbVm","level":5},{"id":"reczOjAWmveW8RSkv","level":6},{"id":"recXz8qMNXvEwIPlO","level":5},{"id":"recl6FCNC8DBsclHV","level":4},{"id":"recps4jQoK8zCW5wI","level":5},{"id":"reco9L9TNFYvZ4Bt6","level":6},{"id":"recS1VZiU2ZNQEJey","level":6},{"id":"recghgiH1DlfS0vv4","level":5},{"id":"recIEuCfChJpc8UyH","level":6},{"id":"recbjdy2SrgCRVBNu","level":4},{"id":"tube1UYqjflF0Pm6Ny","level":4},{"id":"recf4znvmRGaGBUNQ","level":5},{"id":"recy4WSQsbpvLjL1g","level":5},{"id":"recyNCBKtjN1MN1mZ","level":5},{"id":"recRRCalqd5y2CyVD","level":6},{"id":"recVpHG0NDURRRycg","level":5},{"id":"recZfuVlR27qVXcAt","level":4},{"id":"recb576QI4qODr9EQ","level":6},{"id":"recEC0V9qBbLSqHhx","level":5},{"id":"recwTYcY432rb0SGA","level":5},{"id":"recZuHNGEtpCbBPUD","level":5},{"id":"rec28mkBzkQlNxsU4","level":5},{"id":"recVpgUtxW3xx5Pu","level":6},{"id":"rec2cFYduLeErwNQE","level":5},{"id":"recbH7WZIRE41pyVE","level":6},{"id":"rec1Z5gkirQNvtjrK","level":5},{"id":"recd3rYCdpWLtHXLk","level":6},{"id":"recTNeDmFIhhWQZi9","level":4},{"id":"recJmEjTV9NacUqZ8","level":5},{"id":"recFj3ODyi6whwFzk","level":3},{"id":"recwoTBW9eVqCl7Vd","level":5},{"id":"recGTIO2R0edgARcA","level":3},{"id":"reczBuVhH7fuC4u3k","level":5},{"id":"recY3xrzPegD40fkO","level":5},{"id":"rec2fpugR3auJLwcH","level":4},{"id":"recEC92AOM3EAcse6","level":4},{"id":"recgPVFxgVPDUkQWX","level":5},{"id":"rec5hclRSqG7gpadZ","level":5},{"id":"recf0RoWlVKSMke8l","level":6},{"id":"recLjGqbXq7Utibkb","level":4},{"id":"recpnZGFdYz0siz9O","level":5},{"id":"recnK0Dzr3R9NGG12","level":5},{"id":"reczVXRbD2PcCcfgf","level":5},{"id":"recCTEeJefuFO1Pjy","level":5},{"id":"recgkzKSGhyw1Gwtz","level":6},{"id":"rec38YpXqa8RtM1Yy","level":6},{"id":"recTVcQOH3zhL8h29","level":6},{"id":"recx9VucrG4p7FAOO","level":4},{"id":"recprH1OzWoAgWvw9","level":5},{"id":"recIMsNGpsxv2GSCI","level":6},{"id":"recdd0tt0BaQxeSj5","level":6},{"id":"recVyULQAf8zFXjCg","level":5},{"id":"recFqgr6NInvODwkw","level":3},{"id":"recvh9JpYxpq3RDdD","level":5},{"id":"recHcnhCd60Uq4APj","level":5},{"id":"recgrxoIilcw9uj0U","level":5},{"id":"recpz9gZET6VJFeen","level":5},{"id":"rece5w6NqPCDo87zS","level":4},{"id":"rec2LvRgMZNGPbSKs","level":4},{"id":"recPtX9sny8yBBvn","level":4},{"id":"recpP9Uaz1x6qq95e","level":4},{"id":"tube2l7fFnDh1vPn4s","level":5},{"id":"rec8lYF4iaCcI6Stl","level":5},{"id":"recYFCpGlmwQwAONl","level":5},{"id":"recW9R9lBG3faLOzL","level":4},{"id":"recZOEoQzjBUQR9hw","level":5},{"id":"rec2Vi2Bg4LdMmEjd","level":4},{"id":"rectTJBNUL6lz0sEJ","level":5},{"id":"recMvKBYMz7qjPn5o","level":4},{"id":"recDXjekxwm1Nh77T","level":4},{"id":"recT17TO1XinYCD95","level":6},{"id":"recO7LXR9gQ2TOiDd","level":3},{"id":"recvalrsm02e63lw4","level":5},{"id":"rectOrHRTau047Kyc","level":3},{"id":"rec53o75CXpVN1soh","level":4},{"id":"recPXUEpkQWNTNtIy","level":6},{"id":"recoPAkxe29Ru3r3h","level":6},{"id":"rec18Fli7IwDRdxUM","level":2},{"id":"recLtN5zlea2WhR6","level":3},{"id":"tube2fIwLdAvLkk5nK","level":2},{"id":"rec1Y7stSsdwX4tkM","level":3},{"id":"rec2fyFEOv1ef9iOY","level":2},{"id":"rec1S5JJUERpVhoYn","level":2},{"id":"rec1upvYVZyTbJJ4J","level":3},{"id":"tube1NLpOetQhutFlA","level":2},{"id":"tubeWKfoLk9Mlg0O0","level":2},{"id":"recWYmbh7BF8BNj4","level":4},{"id":"recPUBbe8eBDIpJH","level":2},{"id":"rec23QiLTJkPc7Sk1","level":2},{"id":"tube25jNBqolYB8V2r","level":3},{"id":"rec2CFQNcZNEpr6jk","level":3},{"id":"rec2mSskzOmeuvu5x","level":3},{"id":"rec1oD4DBP8UIXzSR","level":3},{"id":"rec1BYw6lxKdlGoPA","level":2},{"id":"tube26F5w4J602048x","level":1},{"id":"tube1vZZM0oflmZWvU","level":2},{"id":"tube1hzZBLOmWp9KoP","level":3},{"id":"tube1weUWgKFzDS1f6","level":2},{"id":"tube1Jgpwmj8j4OMYb","level":4},{"id":"tube1fUwkP4nkSMt3H","level":2},{"id":"tube28coNkBrSHdW34","level":2},{"id":"tubeL9gPGU3vgfGuC","level":2},{"id":"tube1ggNIZJYHY4sxA","level":2},{"id":"tube29I1zg5tzEQU0H","level":2},{"id":"tube28291WoQhI8rLB","level":2},{"id":"tube1xnoVru2aOYLRF","level":2},{"id":"tube15ybmhs2qK2vYd","level":3},{"id":"tube2x5v8i5gRE3inE","level":1},{"id":"tube1TzWCkSfVTOTIA","level":2}]',
      name: '[Pix+Édu] Parcours CRCN + CRCNÉ',
    },
    {
      scope: 'CappedTubes',
      threshold: 60,
      cappedTubes:
        '[{"id":"rec18Fli7IwDRdxUM","level":2},{"id":"recLtN5zlea2WhR6","level":3},{"id":"tube2fIwLdAvLkk5nK","level":2},{"id":"rec1Y7stSsdwX4tkM","level":3},{"id":"rec2fyFEOv1ef9iOY","level":2},{"id":"rec1S5JJUERpVhoYn","level":2},{"id":"rec1upvYVZyTbJJ4J","level":3},{"id":"tube1NLpOetQhutFlA","level":2},{"id":"tubeWKfoLk9Mlg0O0","level":2},{"id":"recWYmbh7BF8BNj4","level":4},{"id":"recPUBbe8eBDIpJH","level":2},{"id":"rec23QiLTJkPc7Sk1","level":2},{"id":"tube25jNBqolYB8V2r","level":3},{"id":"rec2CFQNcZNEpr6jk","level":3},{"id":"rec2mSskzOmeuvu5x","level":3},{"id":"rec1oD4DBP8UIXzSR","level":3},{"id":"rec1BYw6lxKdlGoPA","level":2},{"id":"tube26F5w4J602048x","level":1},{"id":"tube1vZZM0oflmZWvU","level":2},{"id":"tube1hzZBLOmWp9KoP","level":3},{"id":"tube1weUWgKFzDS1f6","level":2},{"id":"tube1Jgpwmj8j4OMYb","level":4},{"id":"tube1fUwkP4nkSMt3H","level":2},{"id":"tube28coNkBrSHdW34","level":2},{"id":"tubeL9gPGU3vgfGuC","level":2},{"id":"tube1ggNIZJYHY4sxA","level":2},{"id":"tube29I1zg5tzEQU0H","level":2},{"id":"tube28291WoQhI8rLB","level":2},{"id":"tube1xnoVru2aOYLRF","level":2},{"id":"tube15ybmhs2qK2vYd","level":3},{"id":"tube2x5v8i5gRE3inE","level":1},{"id":"tube1TzWCkSfVTOTIA","level":2}]',
      name: '[Pix+Édu 1er degré] Parcours CRCNÉ',
    },
  ].map(({ scope, threshold, cappedTubes, name }) => {
    databaseBuilder.factory.buildBadgeCriterion({
      badgeId: PIX_EDU_1ER_DEGRE_FI_CONFIRME_CERTIFIABLE_BADGE_ID,
      scope,
      threshold,
      cappedTubes,
      name,
    });
  });

  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: PIX_EDU_1ER_DEGRE_FI_CONFIRME_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
    badgeId: PIX_EDU_1ER_DEGRE_FI_CONFIRME_CERTIFIABLE_BADGE_ID,
    complementaryCertificationId: PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    level: 2,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-confirme_PREMIER-DEGRE.svg',
    label: 'Pix+ Édu FI 1er degré Confirmé',
    certificateMessage: 'Vous avez obtenu la certification Pix+Édu niveau “Confirmé”',
    temporaryCertificateMessage:
      'Vous avez obtenu le niveau “Confirmé” dans le cadre du volet 1 de la certification Pix+Édu. Votre niveau final sera déterminé à l’issue du volet 2',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_1er_confirme.pdf',
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
  });
}

function _createPixEdu2ndDegre(databaseBuilder) {
  databaseBuilder.factory.buildComplementaryCertification.pixEdu2ndDegre({
    id: PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
  });
  databaseBuilder.factory.buildTargetProfile({
    id: PIX_EDU_2ND_DEGRE_TARGET_PROFILE_ID,
    imageUrl: null,
    description: null,
    name: '[Pix+Édu 2D FI] Prêt pour la certification du volet 1 (CRCN et CRCNÉ) 20 04 2023',
    isSimplifiedAccess: false,
    category: 'PREDEFINED',
    isPublic: true,
    ownerOrganizationId: PRO_ORGANIZATION_ID,
  });
  [
    { tubeId: 'rec5D8oOcnSVc1wb5', level: 6 },
    { tubeId: 'recS1VZiU2ZNQEJey', level: 6 },
    { tubeId: 'recFj3ODyi6whwFzk', level: 3 },
    { tubeId: 'recy4WSQsbpvLjL1g', level: 5 },
    { tubeId: 'recfRTGX0vJNzhApQ', level: 6 },
    { tubeId: 'rec1oD4DBP8UIXzSR', level: 3 },
    { tubeId: 'recWYmbh7BF8BNj4', level: 4 },
    { tubeId: 'rec2LvRgMZNGPbSKs', level: 4 },
    { tubeId: 'rec1S5JJUERpVhoYn', level: 2 },
    { tubeId: 'rec2gMOBRcypr0ckl', level: 2 },
    { tubeId: 'rec2fyFEOv1ef9iOY', level: 2 },
    { tubeId: 'rec28mkBzkQlNxsU4', level: 5 },
    { tubeId: 'recsoZIZxVEr3h2og', level: 5 },
    { tubeId: 'rec2fpugR3auJLwcH', level: 4 },
    { tubeId: 'rec2CFQNcZNEpr6jk', level: 3 },
    { tubeId: 'recCTEeJefuFO1Pjy', level: 5 },
    { tubeId: 'rec2Vi2Bg4LdMmEjd', level: 4 },
    { tubeId: 'recLtN5zlea2WhR6', level: 3 },
    { tubeId: 'recPtX9sny8yBBvn', level: 4 },
    { tubeId: 'rece5w6NqPCDo87zS', level: 4 },
    { tubeId: 'rec18Fli7IwDRdxUM', level: 2 },
    { tubeId: 'rec1BYw6lxKdlGoPA', level: 2 },
    { tubeId: 'rec1Y7stSsdwX4tkM', level: 3 },
    { tubeId: 'recVpgUtxW3xx5Pu', level: 6 },
    { tubeId: 'rec2cFYduLeErwNQE', level: 5 },
    { tubeId: 'rec23QiLTJkPc7Sk1', level: 2 },
    { tubeId: 'recYmSqXBdRWCbTL6', level: 6 },
    { tubeId: 'recPUBbe8eBDIpJH', level: 2 },
    { tubeId: 'rec1gP2RFbGcAaKC3', level: 5 },
    { tubeId: 'recDXjekxwm1Nh77T', level: 4 },
    { tubeId: 'rec4RO6t7qai3ODuJ', level: 5 },
    { tubeId: 'rec2lCszrDoN3t4XI', level: 2 },
    { tubeId: 'recoPAkxe29Ru3r3h', level: 6 },
    { tubeId: 'rec2mSskzOmeuvu5x', level: 3 },
    { tubeId: 'recLlI3H6pPzlZ3c', level: 2 },
    { tubeId: 'reczBuVhH7fuC4u3k', level: 5 },
    { tubeId: 'recZOEoQzjBUQR9hw', level: 5 },
    { tubeId: 'recnK0Dzr3R9NGG12', level: 5 },
    { tubeId: 'recZfuVlR27qVXcAt', level: 4 },
    { tubeId: 'rectTJBNUL6lz0sEJ', level: 5 },
    { tubeId: 'recb576QI4qODr9EQ', level: 6 },
    { tubeId: 'recW9R9lBG3faLOzL', level: 4 },
    { tubeId: 'recIEuCfChJpc8UyH', level: 6 },
    { tubeId: 'recVpHG0NDURRRycg', level: 5 },
    { tubeId: 'recO7LXR9gQ2TOiDd', level: 3 },
    { tubeId: 'reccqGUKgzIOK8f9U', level: 4 },
    { tubeId: 'rec1Z5gkirQNvtjrK', level: 5 },
    { tubeId: 'recqjSAxTnNej5zSQ', level: 6 },
    { tubeId: 'recYFCpGlmwQwAONl', level: 5 },
    { tubeId: 'recY3xrzPegD40fkO', level: 5 },
    { tubeId: 'rec5hclRSqG7gpadZ', level: 5 },
    { tubeId: 'rec38YpXqa8RtM1Yy', level: 6 },
    { tubeId: 'recpz9gZET6VJFeen', level: 5 },
    { tubeId: 'recghgiH1DlfS0vv4', level: 5 },
    { tubeId: 'recEC0V9qBbLSqHhx', level: 5 },
    { tubeId: 'recf0RoWlVKSMke8l', level: 6 },
    { tubeId: 'reczVXRbD2PcCcfgf', level: 5 },
    { tubeId: 'recpe7Y8Wq2D56q6I', level: 6 },
    { tubeId: 'recd3rYCdpWLtHXLk', level: 6 },
    { tubeId: 'recwoTBW9eVqCl7Vd', level: 5 },
    { tubeId: 'recyNCBKtjN1MN1mZ', level: 5 },
    { tubeId: 'rec8lYF4iaCcI6Stl', level: 5 },
    { tubeId: 'reczOjAWmveW8RSkv', level: 6 },
    { tubeId: 'recMvKBYMz7qjPn5o', level: 4 },
    { tubeId: 'recdd0tt0BaQxeSj5', level: 6 },
    { tubeId: 'recJmEjTV9NacUqZ8', level: 5 },
    { tubeId: 'recprH1OzWoAgWvw9', level: 5 },
    { tubeId: 'recTVcQOH3zhL8h29', level: 6 },
    { tubeId: 'recbjdy2SrgCRVBNu', level: 4 },
    { tubeId: 'recwanhWqP3VMPic1', level: 5 },
    { tubeId: 'recgkzKSGhyw1Gwtz', level: 6 },
    { tubeId: 'recvalrsm02e63lw4', level: 5 },
    { tubeId: 'recgrxoIilcw9uj0U', level: 5 },
    { tubeId: 'recgPVFxgVPDUkQWX', level: 5 },
    { tubeId: 'recEC92AOM3EAcse6', level: 4 },
    { tubeId: 'recf4znvmRGaGBUNQ', level: 5 },
    { tubeId: 'rectOrHRTau047Kyc', level: 3 },
    { tubeId: 'reco9L9TNFYvZ4Bt6', level: 6 },
    { tubeId: 'rec53o75CXpVN1soh', level: 4 },
    { tubeId: 'recZuHNGEtpCbBPUD', level: 5 },
    { tubeId: 'recPOjwrHFhM21yGE', level: 5 },
    { tubeId: 'recIMsNGpsxv2GSCI', level: 6 },
    { tubeId: 'rec1upvYVZyTbJJ4J', level: 3 },
    { tubeId: 'recYwQBNHPtwEIchq', level: 4 },
    { tubeId: 'recbH7WZIRE41pyVE', level: 6 },
    { tubeId: 'recx9VucrG4p7FAOO', level: 4 },
    { tubeId: 'recwTYcY432rb0SGA', level: 5 },
    { tubeId: 'recLjGqbXq7Utibkb', level: 4 },
    { tubeId: 'recPXUEpkQWNTNtIy', level: 6 },
    { tubeId: 'recVyULQAf8zFXjCg', level: 5 },
    { tubeId: 'recN4ik49NYTUUbVm', level: 5 },
    { tubeId: 'recGTIO2R0edgARcA', level: 3 },
    { tubeId: 'recl6FCNC8DBsclHV', level: 4 },
    { tubeId: 'recps4jQoK8zCW5wI', level: 5 },
    { tubeId: 'recRRCalqd5y2CyVD', level: 6 },
    { tubeId: 'recTNeDmFIhhWQZi9', level: 4 },
    { tubeId: 'recBbCIEKgrQi7eb6', level: 6 },
    { tubeId: 'recXz8qMNXvEwIPlO', level: 5 },
    { tubeId: 'recpnZGFdYz0siz9O', level: 5 },
    { tubeId: 'tube28291WoQhI8rLB', level: 2 },
    { tubeId: 'tube1weUWgKFzDS1f6', level: 2 },
    { tubeId: 'tube1UYqjflF0Pm6Ny', level: 4 },
    { tubeId: 'tube1xnoVru2aOYLRF', level: 2 },
    { tubeId: 'tube29I1zg5tzEQU0H', level: 2 },
    { tubeId: 'tube1Jgpwmj8j4OMYb', level: 4 },
    { tubeId: 'tube2fkLl5aBvQdMyv', level: 2 },
    { tubeId: 'tubeWKfoLk9Mlg0O0', level: 2 },
    { tubeId: 'tube28coNkBrSHdW34', level: 2 },
    { tubeId: 'recpP9Uaz1x6qq95e', level: 4 },
    { tubeId: 'tube1vZZM0oflmZWvU', level: 2 },
    { tubeId: 'recT17TO1XinYCD95', level: 6 },
    { tubeId: 'tube2l7fFnDh1vPn4s', level: 5 },
    { tubeId: 'tube1fUwkP4nkSMt3H', level: 2 },
    { tubeId: 'tube1TzWCkSfVTOTIA', level: 2 },
    { tubeId: 'tube1hzZBLOmWp9KoP', level: 3 },
    { tubeId: 'tubeL9gPGU3vgfGuC', level: 2 },
    { tubeId: 'tube2x5v8i5gRE3inE', level: 1 },
    { tubeId: 'tube15ybmhs2qK2vYd', level: 3 },
    { tubeId: 'tube1ggNIZJYHY4sxA', level: 2 },
    { tubeId: 'tube26F5w4J602048x', level: 1 },
  ].map(({ tubeId, level }) => {
    databaseBuilder.factory.buildTargetProfileTube({
      targetProfileId: PIX_EDU_2ND_DEGRE_TARGET_PROFILE_ID,
      tubeId,
      level,
    });
  });

  databaseBuilder.factory.buildBadge({
    id: PIX_EDU_2ND_DEGRE_INITIE_CERTIFIABLE_BADGE_ID,
    targetProfileId: PIX_EDU_2ND_DEGRE_TARGET_PROFILE_ID,
    message:
      'Félicitations ! Votre profil est prêt pour vous présenter à une certification Pix+Édu de niveau Initié (entrée dans le métier).',
    altMessage: 'Pix+Édu niveau Initié (entrée dans le métier)',
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-1-Initie.svg',
    key: badges.keys.PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
    title: 'Pix+Édu niveau Initié (entrée dans le métier)',
    isCertifiable: true,
    isAlwaysVisible: false,
  });

  [
    {
      scope: 'CappedTubes',
      threshold: 50,
      cappedTubes:
        '[{"id":"recPOjwrHFhM21yGE","level":5},{"id":"recpe7Y8Wq2D56q6I","level":6},{"id":"recBbCIEKgrQi7eb6","level":6},{"id":"reccqGUKgzIOK8f9U","level":4},{"id":"rec4RO6t7qai3ODuJ","level":5},{"id":"recsoZIZxVEr3h2og","level":5},{"id":"recYmSqXBdRWCbTL6","level":6},{"id":"rec5D8oOcnSVc1wb5","level":6},{"id":"recqjSAxTnNej5zSQ","level":6},{"id":"recYwQBNHPtwEIchq","level":4},{"id":"recfRTGX0vJNzhApQ","level":6},{"id":"recwanhWqP3VMPic1","level":5},{"id":"rec1gP2RFbGcAaKC3","level":5},{"id":"recN4ik49NYTUUbVm","level":5},{"id":"reczOjAWmveW8RSkv","level":6},{"id":"recXz8qMNXvEwIPlO","level":5},{"id":"recl6FCNC8DBsclHV","level":4},{"id":"recps4jQoK8zCW5wI","level":5},{"id":"reco9L9TNFYvZ4Bt6","level":6},{"id":"recS1VZiU2ZNQEJey","level":6},{"id":"recghgiH1DlfS0vv4","level":5},{"id":"recIEuCfChJpc8UyH","level":6},{"id":"recbjdy2SrgCRVBNu","level":4},{"id":"tube1UYqjflF0Pm6Ny","level":4},{"id":"recf4znvmRGaGBUNQ","level":5},{"id":"recy4WSQsbpvLjL1g","level":5},{"id":"recyNCBKtjN1MN1mZ","level":5},{"id":"recRRCalqd5y2CyVD","level":6},{"id":"recVpHG0NDURRRycg","level":5},{"id":"recZfuVlR27qVXcAt","level":4},{"id":"recb576QI4qODr9EQ","level":6},{"id":"recEC0V9qBbLSqHhx","level":5},{"id":"recwTYcY432rb0SGA","level":5},{"id":"recZuHNGEtpCbBPUD","level":5},{"id":"rec28mkBzkQlNxsU4","level":5},{"id":"recVpgUtxW3xx5Pu","level":6},{"id":"rec2cFYduLeErwNQE","level":5},{"id":"recbH7WZIRE41pyVE","level":6},{"id":"rec1Z5gkirQNvtjrK","level":5},{"id":"recd3rYCdpWLtHXLk","level":6},{"id":"recTNeDmFIhhWQZi9","level":4},{"id":"recJmEjTV9NacUqZ8","level":5},{"id":"recFj3ODyi6whwFzk","level":3},{"id":"recwoTBW9eVqCl7Vd","level":5},{"id":"recGTIO2R0edgARcA","level":3},{"id":"reczBuVhH7fuC4u3k","level":5},{"id":"recY3xrzPegD40fkO","level":5},{"id":"rec2fpugR3auJLwcH","level":4},{"id":"recEC92AOM3EAcse6","level":4},{"id":"recgPVFxgVPDUkQWX","level":5},{"id":"rec5hclRSqG7gpadZ","level":5},{"id":"recf0RoWlVKSMke8l","level":6},{"id":"recLjGqbXq7Utibkb","level":4},{"id":"recpnZGFdYz0siz9O","level":5},{"id":"recnK0Dzr3R9NGG12","level":5},{"id":"reczVXRbD2PcCcfgf","level":5},{"id":"recCTEeJefuFO1Pjy","level":5},{"id":"recgkzKSGhyw1Gwtz","level":6},{"id":"rec38YpXqa8RtM1Yy","level":6},{"id":"recTVcQOH3zhL8h29","level":6},{"id":"recx9VucrG4p7FAOO","level":4},{"id":"recprH1OzWoAgWvw9","level":5},{"id":"recIMsNGpsxv2GSCI","level":6},{"id":"recdd0tt0BaQxeSj5","level":6},{"id":"recVyULQAf8zFXjCg","level":5},{"id":"recgrxoIilcw9uj0U","level":5},{"id":"recpz9gZET6VJFeen","level":5},{"id":"rece5w6NqPCDo87zS","level":4},{"id":"rec2LvRgMZNGPbSKs","level":4},{"id":"recPtX9sny8yBBvn","level":4},{"id":"recpP9Uaz1x6qq95e","level":4},{"id":"tube2l7fFnDh1vPn4s","level":5},{"id":"rec8lYF4iaCcI6Stl","level":5},{"id":"recYFCpGlmwQwAONl","level":5},{"id":"recW9R9lBG3faLOzL","level":4},{"id":"recZOEoQzjBUQR9hw","level":5},{"id":"rec2Vi2Bg4LdMmEjd","level":4},{"id":"rectTJBNUL6lz0sEJ","level":5},{"id":"recMvKBYMz7qjPn5o","level":4},{"id":"recDXjekxwm1Nh77T","level":4},{"id":"recT17TO1XinYCD95","level":6},{"id":"recO7LXR9gQ2TOiDd","level":3},{"id":"recvalrsm02e63lw4","level":5},{"id":"rectOrHRTau047Kyc","level":3},{"id":"rec53o75CXpVN1soh","level":4},{"id":"recPXUEpkQWNTNtIy","level":6},{"id":"recoPAkxe29Ru3r3h","level":6},{"id":"rec18Fli7IwDRdxUM","level":2},{"id":"recLtN5zlea2WhR6","level":3},{"id":"rec2gMOBRcypr0ckl","level":2},{"id":"rec1Y7stSsdwX4tkM","level":3},{"id":"rec2fyFEOv1ef9iOY","level":2},{"id":"rec1S5JJUERpVhoYn","level":2},{"id":"recLlI3H6pPzlZ3c","level":2},{"id":"rec1upvYVZyTbJJ4J","level":3},{"id":"tubeWKfoLk9Mlg0O0","level":2},{"id":"recWYmbh7BF8BNj4","level":4},{"id":"recPUBbe8eBDIpJH","level":2},{"id":"rec23QiLTJkPc7Sk1","level":2},{"id":"rec2CFQNcZNEpr6jk","level":3},{"id":"rec2mSskzOmeuvu5x","level":3},{"id":"rec1oD4DBP8UIXzSR","level":3},{"id":"rec2lCszrDoN3t4XI","level":2},{"id":"rec1BYw6lxKdlGoPA","level":2},{"id":"tube26F5w4J602048x","level":1},{"id":"tube1vZZM0oflmZWvU","level":2},{"id":"tube1hzZBLOmWp9KoP","level":3},{"id":"tube1weUWgKFzDS1f6","level":2},{"id":"tube1Jgpwmj8j4OMYb","level":4},{"id":"tube1fUwkP4nkSMt3H","level":2},{"id":"tube28coNkBrSHdW34","level":2},{"id":"tubeL9gPGU3vgfGuC","level":2},{"id":"tube2fkLl5aBvQdMyv","level":2},{"id":"tube1ggNIZJYHY4sxA","level":2},{"id":"tube29I1zg5tzEQU0H","level":2},{"id":"tube28291WoQhI8rLB","level":2},{"id":"tube1xnoVru2aOYLRF","level":2},{"id":"tube15ybmhs2qK2vYd","level":3},{"id":"tube2x5v8i5gRE3inE","level":1},{"id":"tube1TzWCkSfVTOTIA","level":2}]',
      name: '[Pix+Édu] Parcours CRCN + CRCNÉ',
    },
    {
      scope: 'CappedTubes',
      threshold: 50,
      cappedTubes:
        '[{"id":"rec18Fli7IwDRdxUM","level":2},{"id":"recLtN5zlea2WhR6","level":3},{"id":"rec2gMOBRcypr0ckl","level":2},{"id":"rec1Y7stSsdwX4tkM","level":3},{"id":"rec2fyFEOv1ef9iOY","level":2},{"id":"rec1S5JJUERpVhoYn","level":2},{"id":"recLlI3H6pPzlZ3c","level":2},{"id":"rec1upvYVZyTbJJ4J","level":3},{"id":"tubeWKfoLk9Mlg0O0","level":2},{"id":"recWYmbh7BF8BNj4","level":4},{"id":"recPUBbe8eBDIpJH","level":2},{"id":"rec23QiLTJkPc7Sk1","level":2},{"id":"rec2CFQNcZNEpr6jk","level":3},{"id":"rec2mSskzOmeuvu5x","level":3},{"id":"rec1oD4DBP8UIXzSR","level":3},{"id":"rec2lCszrDoN3t4XI","level":2},{"id":"rec1BYw6lxKdlGoPA","level":2},{"id":"tube26F5w4J602048x","level":1},{"id":"tube1vZZM0oflmZWvU","level":2},{"id":"tube1hzZBLOmWp9KoP","level":3},{"id":"tube1weUWgKFzDS1f6","level":2},{"id":"tube1Jgpwmj8j4OMYb","level":4},{"id":"tube1fUwkP4nkSMt3H","level":2},{"id":"tube28coNkBrSHdW34","level":2},{"id":"tubeL9gPGU3vgfGuC","level":2},{"id":"tube2fkLl5aBvQdMyv","level":2},{"id":"tube1ggNIZJYHY4sxA","level":2},{"id":"tube29I1zg5tzEQU0H","level":2},{"id":"tube28291WoQhI8rLB","level":2},{"id":"tube1xnoVru2aOYLRF","level":2},{"id":"tube15ybmhs2qK2vYd","level":3},{"id":"tube2x5v8i5gRE3inE","level":1},{"id":"tube1TzWCkSfVTOTIA","level":2}]',
      name: '[Pix+Édu 2nd degré] Parcours CRCNÉ',
    },
  ].map(({ scope, threshold, cappedTubes, name }) => {
    databaseBuilder.factory.buildBadgeCriterion({
      badgeId: PIX_EDU_2ND_DEGRE_INITIE_CERTIFIABLE_BADGE_ID,
      scope,
      threshold,
      cappedTubes,
      name,
    });
  });

  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: PIX_EDU_2ND_DEGRE_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
    badgeId: PIX_EDU_2ND_DEGRE_INITIE_CERTIFIABLE_BADGE_ID,
    complementaryCertificationId: PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    level: 1,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-1-Initie-certif.svg',
    label: 'Pix+ Édu 2nd degré Initié (entrée dans le métier)',
    certificateMessage: 'Vous avez obtenu la certification Pix+Édu niveau “Initié (entrée dans le métier)”',
    temporaryCertificateMessage:
      'Vous avez obtenu le niveau “Initié (entrée dans le métier)” dans le cadre du volet 1 de la certification Pix+Édu. Votre niveau final sera déterminé à l’issue du volet 2',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_2nd_initie.pdf',
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
  });

  databaseBuilder.factory.buildBadge({
    id: PIX_EDU_2ND_DEGRE_CONFIRME_CERTIFIABLE_BADGE_ID,
    targetProfileId: PIX_EDU_2ND_DEGRE_TARGET_PROFILE_ID,
    message:
      'Félicitations ! Votre profil est prêt pour vous présenter à une certification Pix+Édu de niveau Confirmé.',
    altMessage: 'Pix+Édu niveau Confirmé',
    key: badges.keys.PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme.svg',
    title: 'Pix+Édu niveau Confirmé',
    isCertifiable: true,
    isAlwaysVisible: false,
  });

  [
    {
      scope: 'CappedTubes',
      threshold: 60,
      cappedTubes:
        '[{"id":"recPOjwrHFhM21yGE","level":5},{"id":"recpe7Y8Wq2D56q6I","level":6},{"id":"recBbCIEKgrQi7eb6","level":6},{"id":"reccqGUKgzIOK8f9U","level":4},{"id":"rec4RO6t7qai3ODuJ","level":5},{"id":"recsoZIZxVEr3h2og","level":5},{"id":"recYmSqXBdRWCbTL6","level":6},{"id":"rec5D8oOcnSVc1wb5","level":6},{"id":"recqjSAxTnNej5zSQ","level":6},{"id":"recYwQBNHPtwEIchq","level":4},{"id":"recfRTGX0vJNzhApQ","level":6},{"id":"recwanhWqP3VMPic1","level":5},{"id":"rec1gP2RFbGcAaKC3","level":5},{"id":"recN4ik49NYTUUbVm","level":5},{"id":"reczOjAWmveW8RSkv","level":6},{"id":"recXz8qMNXvEwIPlO","level":5},{"id":"recl6FCNC8DBsclHV","level":4},{"id":"recps4jQoK8zCW5wI","level":5},{"id":"reco9L9TNFYvZ4Bt6","level":6},{"id":"recS1VZiU2ZNQEJey","level":6},{"id":"recghgiH1DlfS0vv4","level":5},{"id":"recIEuCfChJpc8UyH","level":6},{"id":"recbjdy2SrgCRVBNu","level":4},{"id":"tube1UYqjflF0Pm6Ny","level":4},{"id":"recf4znvmRGaGBUNQ","level":5},{"id":"recy4WSQsbpvLjL1g","level":5},{"id":"recyNCBKtjN1MN1mZ","level":5},{"id":"recRRCalqd5y2CyVD","level":6},{"id":"recVpHG0NDURRRycg","level":5},{"id":"recZfuVlR27qVXcAt","level":4},{"id":"recb576QI4qODr9EQ","level":6},{"id":"recEC0V9qBbLSqHhx","level":5},{"id":"recwTYcY432rb0SGA","level":5},{"id":"recZuHNGEtpCbBPUD","level":5},{"id":"rec28mkBzkQlNxsU4","level":5},{"id":"recVpgUtxW3xx5Pu","level":6},{"id":"rec2cFYduLeErwNQE","level":5},{"id":"recbH7WZIRE41pyVE","level":6},{"id":"rec1Z5gkirQNvtjrK","level":5},{"id":"recd3rYCdpWLtHXLk","level":6},{"id":"recTNeDmFIhhWQZi9","level":4},{"id":"recJmEjTV9NacUqZ8","level":5},{"id":"recFj3ODyi6whwFzk","level":3},{"id":"recwoTBW9eVqCl7Vd","level":5},{"id":"recGTIO2R0edgARcA","level":3},{"id":"reczBuVhH7fuC4u3k","level":5},{"id":"recY3xrzPegD40fkO","level":5},{"id":"rec2fpugR3auJLwcH","level":4},{"id":"recEC92AOM3EAcse6","level":4},{"id":"recgPVFxgVPDUkQWX","level":5},{"id":"rec5hclRSqG7gpadZ","level":5},{"id":"recf0RoWlVKSMke8l","level":6},{"id":"recLjGqbXq7Utibkb","level":4},{"id":"recpnZGFdYz0siz9O","level":5},{"id":"recnK0Dzr3R9NGG12","level":5},{"id":"reczVXRbD2PcCcfgf","level":5},{"id":"recCTEeJefuFO1Pjy","level":5},{"id":"recgkzKSGhyw1Gwtz","level":6},{"id":"rec38YpXqa8RtM1Yy","level":6},{"id":"recTVcQOH3zhL8h29","level":6},{"id":"recx9VucrG4p7FAOO","level":4},{"id":"recprH1OzWoAgWvw9","level":5},{"id":"recIMsNGpsxv2GSCI","level":6},{"id":"recdd0tt0BaQxeSj5","level":6},{"id":"recVyULQAf8zFXjCg","level":5},{"id":"recgrxoIilcw9uj0U","level":5},{"id":"recpz9gZET6VJFeen","level":5},{"id":"rece5w6NqPCDo87zS","level":4},{"id":"rec2LvRgMZNGPbSKs","level":4},{"id":"recPtX9sny8yBBvn","level":4},{"id":"recpP9Uaz1x6qq95e","level":4},{"id":"tube2l7fFnDh1vPn4s","level":5},{"id":"rec8lYF4iaCcI6Stl","level":5},{"id":"recYFCpGlmwQwAONl","level":5},{"id":"recW9R9lBG3faLOzL","level":4},{"id":"recZOEoQzjBUQR9hw","level":5},{"id":"rec2Vi2Bg4LdMmEjd","level":4},{"id":"rectTJBNUL6lz0sEJ","level":5},{"id":"recMvKBYMz7qjPn5o","level":4},{"id":"recDXjekxwm1Nh77T","level":4},{"id":"recT17TO1XinYCD95","level":6},{"id":"recO7LXR9gQ2TOiDd","level":3},{"id":"recvalrsm02e63lw4","level":5},{"id":"rectOrHRTau047Kyc","level":3},{"id":"rec53o75CXpVN1soh","level":4},{"id":"recPXUEpkQWNTNtIy","level":6},{"id":"recoPAkxe29Ru3r3h","level":6},{"id":"rec18Fli7IwDRdxUM","level":2},{"id":"recLtN5zlea2WhR6","level":3},{"id":"rec2gMOBRcypr0ckl","level":2},{"id":"rec1Y7stSsdwX4tkM","level":3},{"id":"rec2fyFEOv1ef9iOY","level":2},{"id":"rec1S5JJUERpVhoYn","level":2},{"id":"recLlI3H6pPzlZ3c","level":2},{"id":"rec1upvYVZyTbJJ4J","level":3},{"id":"tubeWKfoLk9Mlg0O0","level":2},{"id":"recWYmbh7BF8BNj4","level":4},{"id":"recPUBbe8eBDIpJH","level":2},{"id":"rec23QiLTJkPc7Sk1","level":2},{"id":"rec2CFQNcZNEpr6jk","level":3},{"id":"rec2mSskzOmeuvu5x","level":3},{"id":"rec1oD4DBP8UIXzSR","level":3},{"id":"rec2lCszrDoN3t4XI","level":2},{"id":"rec1BYw6lxKdlGoPA","level":2},{"id":"tube26F5w4J602048x","level":1},{"id":"tube1vZZM0oflmZWvU","level":2},{"id":"tube1hzZBLOmWp9KoP","level":3},{"id":"tube1weUWgKFzDS1f6","level":2},{"id":"tube1Jgpwmj8j4OMYb","level":4},{"id":"tube1fUwkP4nkSMt3H","level":2},{"id":"tube28coNkBrSHdW34","level":2},{"id":"tubeL9gPGU3vgfGuC","level":2},{"id":"tube2fkLl5aBvQdMyv","level":2},{"id":"tube1ggNIZJYHY4sxA","level":2},{"id":"tube29I1zg5tzEQU0H","level":2},{"id":"tube28291WoQhI8rLB","level":2},{"id":"tube1xnoVru2aOYLRF","level":2},{"id":"tube15ybmhs2qK2vYd","level":3},{"id":"tube2x5v8i5gRE3inE","level":1},{"id":"tube1TzWCkSfVTOTIA","level":2}]',
      name: '[Pix+Édu] Parcours CRCN + CRCNÉ',
    },
    {
      scope: 'CappedTubes',
      threshold: 60,
      cappedTubes:
        '[{"id":"rec18Fli7IwDRdxUM","level":2},{"id":"recLtN5zlea2WhR6","level":3},{"id":"rec2gMOBRcypr0ckl","level":2},{"id":"rec1Y7stSsdwX4tkM","level":3},{"id":"rec2fyFEOv1ef9iOY","level":2},{"id":"rec1S5JJUERpVhoYn","level":2},{"id":"recLlI3H6pPzlZ3c","level":2},{"id":"rec1upvYVZyTbJJ4J","level":3},{"id":"tubeWKfoLk9Mlg0O0","level":2},{"id":"recWYmbh7BF8BNj4","level":4},{"id":"recPUBbe8eBDIpJH","level":2},{"id":"rec23QiLTJkPc7Sk1","level":2},{"id":"rec2CFQNcZNEpr6jk","level":3},{"id":"rec2mSskzOmeuvu5x","level":3},{"id":"rec1oD4DBP8UIXzSR","level":3},{"id":"rec2lCszrDoN3t4XI","level":2},{"id":"rec1BYw6lxKdlGoPA","level":2},{"id":"tube26F5w4J602048x","level":1},{"id":"tube1vZZM0oflmZWvU","level":2},{"id":"tube1hzZBLOmWp9KoP","level":3},{"id":"tube1weUWgKFzDS1f6","level":2},{"id":"tube1Jgpwmj8j4OMYb","level":4},{"id":"tube1fUwkP4nkSMt3H","level":2},{"id":"tube28coNkBrSHdW34","level":2},{"id":"tubeL9gPGU3vgfGuC","level":2},{"id":"tube2fkLl5aBvQdMyv","level":2},{"id":"tube1ggNIZJYHY4sxA","level":2},{"id":"tube29I1zg5tzEQU0H","level":2},{"id":"tube28291WoQhI8rLB","level":2},{"id":"tube1xnoVru2aOYLRF","level":2},{"id":"tube15ybmhs2qK2vYd","level":3},{"id":"tube2x5v8i5gRE3inE","level":1},{"id":"tube1TzWCkSfVTOTIA","level":2}]',
      name: '[Pix+Édu 2nd degré] Parcours CRCNÉ',
    },
  ].map(({ scope, threshold, cappedTubes, name }) => {
    databaseBuilder.factory.buildBadgeCriterion({
      badgeId: PIX_EDU_2ND_DEGRE_CONFIRME_CERTIFIABLE_BADGE_ID,
      scope,
      threshold,
      cappedTubes,
      name,
    });
  });

  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: PIX_EDU_2ND_DEGRE_CONFIRME_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
    badgeId: PIX_EDU_2ND_DEGRE_CONFIRME_CERTIFIABLE_BADGE_ID,
    complementaryCertificationId: PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    level: 2,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme-certif.svg',
    label: 'Pix+ Édu 2nd degré Confirmé',
    certificateMessage: 'Vous avez obtenu la certification Pix+Édu niveau “Confirmé”',
    temporaryCertificateMessage:
      'Vous avez obtenu le niveau “Confirmé” dans le cadre du volet 1 de la certification Pix+Édu. Votre niveau final sera déterminé à l’issue du volet 2',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_2nd_confirme.pdf',
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
  });
}

function _createCountries(databaseBuilder) {
  databaseBuilder.factory.buildCertificationCpfCountry({
    code: '99401',
    commonName: 'CANADA',
    originalName: 'CANADA',
  });

  databaseBuilder.factory.buildCertificationCpfCountry({
    code: '99100',
    commonName: 'FRANCE',
    originalName: 'FRANCE',
  });

  databaseBuilder.factory.buildCertificationCpfCountry({
    code: '99345',
    commonName: 'TOGO',
    originalName: 'TOGO',
  });

  databaseBuilder.factory.buildCertificationCpfCountry({
    code: '99243',
    commonName: 'VIET NAM',
    originalName: 'VIET NAM',
  });

  databaseBuilder.factory.buildCertificationCpfCountry({
    code: '99425',
    commonName: 'TURKS ET CAIQUES (ILES)',
    originalName: 'TURKS ET CAÏQUES (ÎLES)',
  });
}

function _createCities(databaseBuilder) {
  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'PARIS 1',
    postalCode: '75001',
    INSEECode: '75101',
  });

  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'PARIS 12',
    postalCode: '75012',
    INSEECode: '75112',
  });

  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'PARIS 15',
    postalCode: '75015',
    INSEECode: '75115',
  });

  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'PARIS 19',
    postalCode: '75019',
    INSEECode: '75119',
  });

  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'PARIS',
    postalCode: '75001',
    INSEECode: '75101',
  });

  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'PARIS',
    postalCode: '75012',
    INSEECode: '75112',
  });

  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'PARIS',
    postalCode: '75015',
    INSEECode: '75115',
  });

  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'PARIS',
    postalCode: '75019',
    INSEECode: '75119',
  });

  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'PERPIGNAN',
    postalCode: '66000',
    INSEECode: '66136',
  });

  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'NANTES',
    postalCode: '44000',
    INSEECode: '44109',
  });

  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'LES-BAUX-DE-BRETEUIL',
    postalCode: '27160',
    INSEECode: '27043',
  });

  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'MARBOIS',
    postalCode: '27160',
    INSEECode: '27157',
  });

  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'MESNILS-SUR-ITON',
    postalCode: '27160',
    INSEECode: '27240',
  });

  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'BUELLAS',
    postalCode: '01310',
    INSEECode: '01065',
  });

  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'LES ABYMES',
    postalCode: '97139',
    INSEECode: '97101',
  });
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
