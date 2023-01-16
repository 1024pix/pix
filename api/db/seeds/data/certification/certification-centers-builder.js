const _ = require('lodash');
const { DEFAULT_PASSWORD } = require('../users-builder');

const SCO_COLLEGE_CERTIF_CENTER_ID = 1;
const GREAT_OAK_CERTIF_CENTER_ID = 23;
const SCO_COLLEGE_CERTIF_CENTER_NAME = 'Centre SCO Collège des Anne-Étoiles';
const SCO_COLLEGE_CERTIF_CENTER_WITHOUT_STUDENT_ID = 8;
const SCO_COLLEGE_CERTIF_CENTER_WITHOUT_STUDENT_NAME = 'Centre SCO Collège sans étudiant';
const SCO_LYCEE_CERTIF_CENTER_ID = 13;
const SCO_LYCEE_CERTIF_CENTER_NAME = 'Centre SCO Lycée des Anne-Étoiles';
const PRO_CERTIF_CENTER_ID = 2;
const PRO_CERTIF_CENTER_NAME = 'Centre PRO des Anne-Étoiles';
const SUP_CERTIF_CENTER_ID = 3;
const SUP_CERTIF_CENTER_NAME = 'Centre SUP des Anne-Étoiles';
const DROIT_CERTIF_CENTER_ID = 5;
const DROIT_CERTIF_CENTER_NAME = 'Centre DROIT des Anne-Étoiles';
const SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_ID = 6;
const SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_NAME = 'Centre AEFE SCO NO MANAGING STUDENTS des Anne-Étoiles';
const SCO_COLLEGE_EXTERNAL_ID = '1237457A';
const SCO_COLLEGE_WITHOUT_STUDENT_EXTERNAL_ID = '1237457G';
const SCO_LYCEE_EXTERNAL_ID = '1237457B';
const SCO_AGRI_EXTERNAL_ID = '1237457C';
const SCO_NO_MANAGING_STUDENTS_EXTERNAL_ID = '1237457E';
const GREAT_OAK_CERTIF_CENTER_EXTERNAL_ID = '1237457M';
const AGRI_SCO_MANAGING_STUDENT_ID = 9;
const AGRI_SCO_MANAGING_STUDENT_NAME = 'Centre AGRI des Anne-Etoiles';
const CLEA_COMPLEMENTARY_CERTIFICATION_ID = 52;
const PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID = 53;
const PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID = 54;
const PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID = 55;
const PIX_CLEA_V3_COMPLEMENTARY_CERTIFICATION_BADGE_ID = 56;
const PIX_DROIT_MAITRE_COMPLEMENTARY_CERTIFICATION_BADGE_ID = 57;
const PIX_EDU_1ER_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID = 58;

const {
  PIX_EMPLOI_CLEA_BADGE_ID_V1,
  PIX_EMPLOI_CLEA_BADGE_ID_V2,
  PIX_EMPLOI_CLEA_BADGE_ID_V3,
  PIX_DROIT_MAITRE_BADGE_ID,
  PIX_DROIT_EXPERT_BADGE_ID,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME_BADGE_ID,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE_BADGE_ID,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME_BADGE_ID,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE_BADGE_ID,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE_BADGE_ID,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME_BADGE_ID,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT_BADGE_ID,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE_BADGE_ID,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME_BADGE_ID,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT_BADGE_ID,
} = require('../badges-builder');

function certificationCentersBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildComplementaryCertification.clea({
    id: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: PIX_EMPLOI_CLEA_BADGE_ID_V1,
    level: 1,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
    imageUrl: 'https://images.pix.fr/badges/CleA_Num_certif.svg',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_clea.pdf',
    label: 'CléA Numérique',
  });

  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: PIX_EMPLOI_CLEA_BADGE_ID_V2,
    level: 2,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
    imageUrl: 'https://images.pix.fr/badges/CleA_Num_certif.svg',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_clea.pdf',
    label: 'CléA Numérique',
  });

  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: PIX_CLEA_V3_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
    badgeId: PIX_EMPLOI_CLEA_BADGE_ID_V3,
    level: 3,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
    imageUrl: 'https://images.pix.fr/badges/CleA_Num_certif.svg',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_clea.pdf',
    label: 'CléA Numérique',
  });

  databaseBuilder.factory.buildComplementaryCertification({
    label: 'Pix+ Droit',
    key: 'DROIT',
    id: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
    minimumReproducibilityRate: 75,
    minimumEarnedPix: null,
  });

  databaseBuilder.factory.buildComplementaryCertification({
    label: 'Pix+ Édu 2nd degré',
    key: 'EDU_2ND_DEGRE',
    id: PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    minimumReproducibilityRate: 70,
    minimumEarnedPix: null,
    hasExternalJury: true,
  });

  databaseBuilder.factory.buildComplementaryCertification({
    label: 'Pix+ Édu 1er degré',
    key: 'EDU_1ER_DEGRE',
    id: PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    minimumReproducibilityRate: 70,
    minimumEarnedPix: null,
    hasExternalJury: true,
  });

  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: PIX_DROIT_MAITRE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
    badgeId: PIX_DROIT_MAITRE_BADGE_ID,
    level: 1,
    complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
    imageUrl: 'https://images.pix.fr/badges-certifies/pix-droit/maitre.svg',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_droit_maitre.pdf',
    label: 'Pix+ Droit Maître',
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: PIX_DROIT_EXPERT_BADGE_ID,
    level: 2,
    complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
    imageUrl: 'https://images.pix.fr/badges-certifies/pix-droit/expert.svg',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_droit_expert.pdf',
    label: 'Pix+ Droit Expert',
  });

  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: PIX_EDU_1ER_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
    badgeId: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE_BADGE_ID,
    level: 1,
    complementaryCertificationId: PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-Autonome_PREMIER-DEGRE.svg',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_1er_initie.pdf',
    label: 'Pix+ Édu 1er degré Initié (entrée dans le métier)',
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE_BADGE_ID,
    level: 1,
    complementaryCertificationId: PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-1-Initie-certif.svg',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_2nd_initie.pdf',
    label: 'Pix+ Édu 2nd degré Initié (entrée dans le métier)',
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME_BADGE_ID,
    level: 2,
    complementaryCertificationId: PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-confirme_PREMIER-DEGRE.svg',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_1er_confirme.pdf',
    label: 'Pix+ Édu 1er degré Confirmé',
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME_BADGE_ID,
    level: 2,
    complementaryCertificationId: PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme-certif.svg',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_2nd_confirme.pdf',
    label: 'Pix+ Édu 2nd degré Confirmé',
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME_BADGE_ID,
    level: 3,
    complementaryCertificationId: PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-confirme_PREMIER-DEGRE.svg',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_1er_confirme.pdf',
    label: 'Pix+ Édu 1er degré Confirmé',
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME_BADGE_ID,
    level: 3,
    complementaryCertificationId: PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme-certif.svg',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_2nd_confirme.pdf',
    label: 'Pix+ Édu 2nd degré Confirmé',
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE_BADGE_ID,
    level: 4,
    complementaryCertificationId: PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-avance_PREMIER-DEGRE.svg',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_1er_avance.pdf',
    label: 'Pix+ Édu 1er degré Avancé',
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE_BADGE_ID,
    level: 4,
    complementaryCertificationId: PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-3-Avance-certif.svg',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_2nd_avance.pdf',
    label: 'Pix+ Édu 2nd degré Avancé',
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT_BADGE_ID,
    level: 5,
    complementaryCertificationId: PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-Expert_PREMIER-DEGRE.svg',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_1er_expert.pdf',
    label: 'Pix+ Édu 1er degré Expert',
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT_BADGE_ID,
    level: 5,
    complementaryCertificationId: PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-4-Expert-certif.svg',
    stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_2nd_expert.pdf',
    label: 'Pix+ Édu 2nd degré Expert',
  });

  const now = new Date();
  const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
    id: SCO_COLLEGE_CERTIF_CENTER_ID,
    name: SCO_COLLEGE_CERTIF_CENTER_NAME,
    externalId: SCO_COLLEGE_EXTERNAL_ID,
    type: 'SCO',
  });
  databaseBuilder.factory.buildCertificationCenter({
    id: SCO_COLLEGE_CERTIF_CENTER_WITHOUT_STUDENT_ID,
    name: SCO_COLLEGE_CERTIF_CENTER_WITHOUT_STUDENT_NAME,
    externalId: SCO_COLLEGE_WITHOUT_STUDENT_EXTERNAL_ID,
    type: 'SCO',
  });
  databaseBuilder.factory.buildDataProtectionOfficer.withCertificationCenterId({
    firstName: 'Yukiko',
    lastName: 'Tsubaki',
    email: 'yukiko.tsubaki@example.net',
    certificationCenterId: certificationCenter.id,
    createdAt: now,
    updatedAt: now,
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: SCO_LYCEE_CERTIF_CENTER_ID,
    name: SCO_LYCEE_CERTIF_CENTER_NAME,
    externalId: SCO_LYCEE_EXTERNAL_ID,
    type: 'SCO',
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_ID,
    name: SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_NAME,
    externalId: SCO_NO_MANAGING_STUDENTS_EXTERNAL_ID,
    type: 'SCO',
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: AGRI_SCO_MANAGING_STUDENT_ID,
    name: AGRI_SCO_MANAGING_STUDENT_NAME,
    externalId: SCO_AGRI_EXTERNAL_ID,
    type: 'SCO',
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: PRO_CERTIF_CENTER_ID,
    name: PRO_CERTIF_CENTER_NAME,
    type: 'PRO',
    isSupervisorAccessEnabled: 'true',
  });
  databaseBuilder.factory.buildComplementaryCertificationHabilitation({
    certificationCenterId: PRO_CERTIF_CENTER_ID,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: SUP_CERTIF_CENTER_ID,
    name: SUP_CERTIF_CENTER_NAME,
    type: 'SUP',
  });
  databaseBuilder.factory.buildComplementaryCertificationHabilitation({
    certificationCenterId: SUP_CERTIF_CENTER_ID,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  });
  databaseBuilder.factory.buildComplementaryCertificationHabilitation({
    certificationCenterId: SUP_CERTIF_CENTER_ID,
    complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: DROIT_CERTIF_CENTER_ID,
    name: DROIT_CERTIF_CENTER_NAME,
    type: 'SUP',
  });
  databaseBuilder.factory.buildComplementaryCertificationHabilitation({
    certificationCenterId: DROIT_CERTIF_CENTER_ID,
    complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  });

  for (let i = 0; i < 200; i++) {
    const types = ['SCO', 'PRO', 'SUP'];
    databaseBuilder.factory.buildCertificationCenter({
      name: `Centre Certif Iteration ${i}`,
      type: types[_.random(0, 2)],
    });
  }

  // Great Oak Certification Center - anonymization purpose
  const greatOakCertificationCenter = databaseBuilder.factory.buildCertificationCenter({
    id: GREAT_OAK_CERTIF_CENTER_ID,
    name: 'Great Oak Certification Center',
    type: 'SCO',
  });
  const greatOakCertificationCenterMember = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Hijuro',
    lastName: 'Butora',
    email: 'hijuro.butora@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
    pixCertifTermsOfServiceAccepted: true,
    lastPixCertifTermsOfServiceValidatedAt: new Date(),
  });
  databaseBuilder.factory.buildCertificationCenterMembership({
    certificationCenterId: greatOakCertificationCenter.id,
    userId: greatOakCertificationCenterMember.id,
  });
}

module.exports = {
  certificationCentersBuilder,
  SCO_COLLEGE_CERTIF_CENTER_ID,
  SCO_COLLEGE_CERTIF_CENTER_NAME,
  PRO_CERTIF_CENTER_ID,
  PRO_CERTIF_CENTER_NAME,
  SUP_CERTIF_CENTER_ID,
  SUP_CERTIF_CENTER_NAME,
  DROIT_CERTIF_CENTER_ID,
  DROIT_CERTIF_CENTER_NAME,
  SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_ID,
  SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_NAME,
  AGRI_SCO_MANAGING_STUDENT_ID,
  AGRI_SCO_MANAGING_STUDENT_NAME,
  SCO_LYCEE_CERTIF_CENTER_ID,
  SCO_LYCEE_CERTIF_CENTER_NAME,
  CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_CLEA_V3_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  PIX_DROIT_MAITRE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  PIX_EDU_1ER_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  SCO_COLLEGE_EXTERNAL_ID,
  SCO_COLLEGE_WITHOUT_STUDENT_EXTERNAL_ID,
  SCO_LYCEE_EXTERNAL_ID,
  SCO_AGRI_EXTERNAL_ID,
  SCO_NO_MANAGING_STUDENTS_EXTERNAL_ID,
  GREAT_OAK_CERTIF_CENTER_EXTERNAL_ID,
};
