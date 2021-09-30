const _ = require('lodash');
const SCO_COLLEGE_CERTIF_CENTER_ID = 1;
const SCO_COLLEGE_CERTIF_CENTER_NAME = 'Centre SCO Collège des Anne-Étoiles';
const PRO_CERTIF_CENTER_ID = 2;
const PRO_CERTIF_CENTER_NAME = 'Centre PRO des Anne-Étoiles';
const SUP_CERTIF_CENTER_ID = 3;
const SUP_CERTIF_CENTER_NAME = 'Centre SUP des Anne-Étoiles';
const NONE_CERTIF_CENTER_ID = 4;
const NONE_CERTIF_CENTER_NAME = 'Centre NOTYPE des Anne-Étoiles';
const DROIT_CERTIF_CENTER_ID = 5;
const DROIT_CERTIF_CENTER_NAME = 'Centre DROIT des Anne-Étoiles';
const SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_ID = 6;
const SCO_NO_MANAGING_STUDENTS_AEFE_CERTIF_CENTER_NAME = 'Centre AEFE SCO NO MANAGING STUDENTS des Anne-Étoiles';
const SCO_COLLEGE_EXTERNAL_ID = '1237457A';
const SCO_AGRI_EXTERNAL_ID = '1237457D';
const SCO_NO_MANAGING_STUDENTS_EXTERNAL_ID = '1237457E';
const AGRI_SCO_MANAGING_STUDENT_ID = 9;
const AGRI_SCO_MANAGING_STUDENT_NAME = 'Centre AGRI des Anne-Etoiles';

const { PIX_EMPLOI_CLEA_BADGE_ID, PIX_DROIT_MAITRE_BADGE_ID, PIX_DROIT_EXPERT_BADGE_ID } = require('../badges-builder');

function certificationCentersBuilder({ databaseBuilder }) {

  const cleaAccreditationId = databaseBuilder.factory.buildAccreditation({
    name: 'CléA Numérique',
  }).id;
  databaseBuilder.factory.buildAccreditedBadge({
    badgeId: PIX_EMPLOI_CLEA_BADGE_ID,
    accreditationId: cleaAccreditationId,
  });

  const pixDroitAccreditationId = databaseBuilder.factory.buildAccreditation({
    name: 'Pix+ Droit',
  }).id;
  databaseBuilder.factory.buildAccreditedBadge({
    badgeId: PIX_DROIT_MAITRE_BADGE_ID,
    accreditationId: pixDroitAccreditationId,
  });
  databaseBuilder.factory.buildAccreditedBadge({
    badgeId: PIX_DROIT_EXPERT_BADGE_ID,
    accreditationId: pixDroitAccreditationId,
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: SCO_COLLEGE_CERTIF_CENTER_ID,
    name: SCO_COLLEGE_CERTIF_CENTER_NAME,
    externalId: SCO_COLLEGE_EXTERNAL_ID,
    type: 'SCO',
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_ID,
    name: SCO_NO_MANAGING_STUDENTS_AEFE_CERTIF_CENTER_NAME,
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
  });
  databaseBuilder.factory.buildGrantedAccreditation({
    certificationCenterId: PRO_CERTIF_CENTER_ID,
    accreditationId: cleaAccreditationId,
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: SUP_CERTIF_CENTER_ID,
    name: SUP_CERTIF_CENTER_NAME,
    type: 'SUP',
  });
  databaseBuilder.factory.buildGrantedAccreditation({
    certificationCenterId: SUP_CERTIF_CENTER_ID,
    accreditationId: cleaAccreditationId,
  });
  databaseBuilder.factory.buildGrantedAccreditation({
    certificationCenterId: SUP_CERTIF_CENTER_ID,
    accreditationId: pixDroitAccreditationId,
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: NONE_CERTIF_CENTER_ID,
    name: NONE_CERTIF_CENTER_NAME,
    type: null,
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: DROIT_CERTIF_CENTER_ID,
    name: DROIT_CERTIF_CENTER_NAME,
    type: null,
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
  NONE_CERTIF_CENTER_ID,
  NONE_CERTIF_CENTER_NAME,
  DROIT_CERTIF_CENTER_ID,
  DROIT_CERTIF_CENTER_NAME,
  SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_ID,
  SCO_NO_MANAGING_STUDENTS_AEFE_CERTIF_CENTER_NAME,
  AGRI_SCO_MANAGING_STUDENT_ID,
  AGRI_SCO_MANAGING_STUDENT_NAME,
};
