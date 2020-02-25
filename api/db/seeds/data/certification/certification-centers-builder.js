const faker = require('faker');

const CERTIF_CENTER_ID = 1;
const CERTIF_CENTER_NAME = 'Centre des Anne-Étoiles';

function certificationCentersBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildCertificationCenter({
    id: CERTIF_CENTER_ID,
    name: CERTIF_CENTER_NAME,
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
  CERTIF_CENTER_ID,
  CERTIF_CENTER_NAME,
};
