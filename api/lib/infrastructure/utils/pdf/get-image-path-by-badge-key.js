const { PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2, PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF } =
  require('../../../domain/models/Badge').keys;

const macaronCleaPath = `${__dirname}/files/macaron_clea.png`;
const macaronPixPlusDroitMaitrePath = `${__dirname}/files/macaron_maitre.png`;
const macaronPixPlusDroitExpertPath = `${__dirname}/files/macaron_expert.png`;

module.exports = function getImagePathByBadgeKey(badgeKey) {
  if ([PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2].includes(badgeKey)) {
    return macaronCleaPath;
  }
  if (badgeKey === PIX_DROIT_MAITRE_CERTIF) {
    return macaronPixPlusDroitMaitrePath;
  }
  if (badgeKey === PIX_DROIT_EXPERT_CERTIF) {
    return macaronPixPlusDroitExpertPath;
  }
};
