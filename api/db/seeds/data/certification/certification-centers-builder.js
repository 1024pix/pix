const faker = require('faker');

const SCO_CERTIF_CENTER_ID = 1;
const SCO_CERTIF_CENTER_NAME = 'Centre SCO des Anne-Étoiles';
const PRO_CERTIF_CENTER_ID = 2;
const PRO_CERTIF_CENTER_NAME = 'Centre PRO des Anne-Étoiles';
const SUP_CERTIF_CENTER_ID = 3;
const SUP_CERTIF_CENTER_NAME = 'Centre SUP des Anne-Étoiles';
const NONE_CERTIF_CENTER_ID = 4;
const NONE_CERTIF_CENTER_NAME = 'Centre NOTYPE des Anne-Étoiles';

function certificationCentersBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildCertificationCenter({
    id: SCO_CERTIF_CENTER_ID,
    name: SCO_CERTIF_CENTER_NAME,
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

  for (let i = 0; i < 200; i++) {
    databaseBuilder.factory.buildCertificationCenter({
      name: `Centre ${faker.name.firstName()} ${faker.name.lastName()}`,
      type: faker.random.arrayElement(['SCO', 'PRO', 'SUP']),
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
};
