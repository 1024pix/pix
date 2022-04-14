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

const macaronCleaPath = `${__dirname}/files/macaron_clea.pdf`;
const macaronPixPlusDroitMaitrePath = `${__dirname}/files/macaron_droit_maitre.pdf`;
const macaronPixPlusDroitExpertPath = `${__dirname}/files/macaron_droit_expert.pdf`;
const macaronPixPlusEduInitiePath = `${__dirname}/files/macaron_edu_2nd_initie.pdf`;
const macaronPixPlusEduConfirmePath = `${__dirname}/files/macaron_edu_2nd_confirme.pdf`;
const macaronPixPlusEduAvancePath = `${__dirname}/files/macaron_edu_2nd_avance.pdf`;
const macaronPixPlusEduExpertPath = `${__dirname}/files/macaron_edu_2nd_expert.pdf`;

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
