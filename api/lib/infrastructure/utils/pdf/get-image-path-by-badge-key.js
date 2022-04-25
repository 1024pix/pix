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
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('../../../domain/models/Badge').keys;

const macaronCleaPath = `${__dirname}/files/macaron_clea.pdf`;
const macaronPixPlusDroitMaitrePath = `${__dirname}/files/macaron_droit_maitre.pdf`;
const macaronPixPlusDroitExpertPath = `${__dirname}/files/macaron_droit_expert.pdf`;
const macaronPixPlusEdu2ndDegreInitiePath = `${__dirname}/files/macaron_edu_2nd_initie.pdf`;
const macaronPixPlusEdu2ndDegreConfirmePath = `${__dirname}/files/macaron_edu_2nd_confirme.pdf`;
const macaronPixPlusEdu2ndDegreAvancePath = `${__dirname}/files/macaron_edu_2nd_avance.pdf`;
const macaronPixPlusEdu2ndDegreExpertPath = `${__dirname}/files/macaron_edu_2nd_expert.pdf`;
const macaronPixPlusEdu1erDegreInitiePath = `${__dirname}/files/macaron_edu_1er_initie.pdf`;
const macaronPixPlusEdu1erDegreConfirmePath = `${__dirname}/files/macaron_edu_1er_confirme.pdf`;
const macaronPixPlusEdu1erDegreAvancePath = `${__dirname}/files/macaron_edu_1er_avance.pdf`;
const macaronPixPlusEdu1erDegreExpertPath = `${__dirname}/files/macaron_edu_1er_expert.pdf`;

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
    return macaronPixPlusEdu2ndDegreInitiePath;
  }
  if (
    [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME].includes(badgeKey)
  ) {
    return macaronPixPlusEdu2ndDegreConfirmePath;
  }
  if (badgeKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE) {
    return macaronPixPlusEdu2ndDegreAvancePath;
  }
  if (badgeKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT) {
    return macaronPixPlusEdu2ndDegreExpertPath;
  }
  if (badgeKey === PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE) {
    return macaronPixPlusEdu1erDegreInitiePath;
  }
  if (
    [PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME].includes(badgeKey)
  ) {
    return macaronPixPlusEdu1erDegreConfirmePath;
  }
  if (badgeKey === PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE) {
    return macaronPixPlusEdu1erDegreAvancePath;
  }
  if (badgeKey === PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT) {
    return macaronPixPlusEdu1erDegreExpertPath;
  }
};
