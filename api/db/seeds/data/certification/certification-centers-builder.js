const _ = require('lodash');
const SCO_COLLEGE_CERTIF_CENTER_ID = 1;
const SCO_COLLEGE_CERTIF_CENTER_NAME = 'Centre SCO Collège des Anne-Étoiles';
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
const SCO_LYCEE_EXTERNAL_ID = '1237457B';
const SCO_AGRI_EXTERNAL_ID = '1237457C';
const SCO_NO_MANAGING_STUDENTS_EXTERNAL_ID = '1237457E';
const AGRI_SCO_MANAGING_STUDENT_ID = 9;
const AGRI_SCO_MANAGING_STUDENT_NAME = 'Centre AGRI des Anne-Etoiles';
const CLEA_COMPLEMENTARY_CERTIFICATION_ID = 52;
const PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID = 53;
const PIX_EDU_COMPLEMENTARY_CERTIFICATION_ID = 54;

const { PIX_EMPLOI_CLEA_BADGE_ID, PIX_DROIT_MAITRE_BADGE_ID, PIX_DROIT_EXPERT_BADGE_ID } = require('../badges-builder');

function certificationCentersBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildComplementaryCertification({
    name: 'CléA Numérique',
    id: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: PIX_EMPLOI_CLEA_BADGE_ID,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  });

  databaseBuilder.factory.buildComplementaryCertification({
    name: 'Pix+ Droit',
    id: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  });

  databaseBuilder.factory.buildComplementaryCertification({
    name: 'Pix+ Édu',
    id: PIX_EDU_COMPLEMENTARY_CERTIFICATION_ID,
  });

  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: PIX_DROIT_MAITRE_BADGE_ID,
    complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: PIX_DROIT_EXPERT_BADGE_ID,
    complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: SCO_COLLEGE_CERTIF_CENTER_ID,
    name: SCO_COLLEGE_CERTIF_CENTER_NAME,
    externalId: SCO_COLLEGE_EXTERNAL_ID,
    type: 'SCO',
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
};
