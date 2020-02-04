const CERTIF_CENTER_ID = 1;
const CERTIF_CENTER_NAME = 'Centre des Anne-Étoiles';

function certificationCentersBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildCertificationCenter({
    id: CERTIF_CENTER_ID,
    name: CERTIF_CENTER_NAME,
  });
}

module.exports = {
  certificationCentersBuilder,
  CERTIF_CENTER_ID,
  CERTIF_CENTER_NAME,
} ;
