const _ = require('lodash');
const SCO_CERTIF_CENTER_ID = 1;
const SCO_CERTIF_CENTER_NAME = 'Centre SCO des Anne-Étoiles';
const PRO_CERTIF_CENTER_ID = 2;
const PRO_CERTIF_CENTER_NAME = 'Centre PRO des Anne-Étoiles';
const SUP_CERTIF_CENTER_ID = 3;
const SUP_CERTIF_CENTER_NAME = 'Centre SUP des Anne-Étoiles';
const NONE_CERTIF_CENTER_ID = 4;
const NONE_CERTIF_CENTER_NAME = 'Centre NOTYPE des Anne-Étoiles';
const DROIT_CERTIF_CENTER_ID = 5;
const DROIT_CERTIF_CENTER_NAME = 'Centre DROIT des Anne-Étoiles';
const SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_ID = 6;
const SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_NAME = 'Centre SCO NO MANAGING STUDENTS des Anne-Étoiles';
const SCO_EXTERNAL_ID = '1237457A';
const SCO_NO_MANAGING_STUDENTS_EXTERNAL_ID = 'AEFE';

function certificationCentersBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildCertificationCenter({
    id: SCO_CERTIF_CENTER_ID,
    name: SCO_CERTIF_CENTER_NAME,
    externalId: SCO_EXTERNAL_ID,
    type: 'SCO',
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_ID,
    name: SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_NAME,
    externalId: SCO_NO_MANAGING_STUDENTS_EXTERNAL_ID,
    type: 'SCO',
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: PRO_CERTIF_CENTER_ID,
    name: PRO_CERTIF_CENTER_NAME,
    type: 'PRO',
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: SUP_CERTIF_CENTER_ID,
    name: SUP_CERTIF_CENTER_NAME,
    type: 'SUP',
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
  SCO_CERTIF_CENTER_ID,
  SCO_CERTIF_CENTER_NAME,
  PRO_CERTIF_CENTER_ID,
  PRO_CERTIF_CENTER_NAME,
  SUP_CERTIF_CENTER_ID,
  SUP_CERTIF_CENTER_NAME,
  NONE_CERTIF_CENTER_ID,
  NONE_CERTIF_CENTER_NAME,
  DROIT_CERTIF_CENTER_ID,
  DROIT_CERTIF_CENTER_NAME,
  SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_ID,
  SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_NAME,
};
