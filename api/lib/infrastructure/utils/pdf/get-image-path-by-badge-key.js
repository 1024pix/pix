const {
  PIX_EMPLOI_CLEA_V1,
  PIX_EMPLOI_CLEA_V2,
  PIX_EMPLOI_CLEA_V3,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
} = require('../../../domain/models/Badge').keys;

const macaronCleaPath = `${__dirname}/files/macaron_clea.png`;
const macaronPixPlusDroitMaitrePath = `${__dirname}/files/macaron_maitre.png`;
const macaronPixPlusDroitExpertPath = `${__dirname}/files/macaron_expert.png`;
const macaronPixPlusEduInitiePath = `${__dirname}/files/macaron_edu_initie.png`;
const macaronPixPlusEduConfirmePath = `${__dirname}/files/macaron_edu_confirme.png`;
const macaronPixPlusEduAvancePath = `${__dirname}/files/macaron_edu_avance.png`;
const macaronPixPlusEduExpertPath = `${__dirname}/files/macaron_edu_expert.png`;

module.exports = function getImagePathByBadgeKey(badgeKey) {
  if ([PIX_EMPLOI_CLEA_V1, PIX_EMPLOI_CLEA_V2, PIX_EMPLOI_CLEA_V3].includes(badgeKey)) {
    return macaronCleaPath;
  }
  if (badgeKey === PIX_DROIT_MAITRE_CERTIF) {
    return macaronPixPlusDroitMaitrePath;
  }
  if (badgeKey === PIX_DROIT_EXPERT_CERTIF) {
    return macaronPixPlusDroitExpertPath;
  }
  if (badgeKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE) {
    return macaronPixPlusEduInitiePath;
  }
  if (
    [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME].includes(badgeKey)
  ) {
    return macaronPixPlusEduConfirmePath;
  }
  if (badgeKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE) {
    return macaronPixPlusEduAvancePath;
  }
  if (badgeKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT) {
    return macaronPixPlusEduExpertPath;
  }
};
