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

const STICKERS_PATH_BADGE_KEY = {
  [PIX_EMPLOI_CLEA_V1]: `${__dirname}/files/stickers/macaron_clea.pdf`,
  [PIX_EMPLOI_CLEA_V2]: `${__dirname}/files/stickers/macaron_clea.pdf`,
  [PIX_EMPLOI_CLEA_V3]: `${__dirname}/files/stickers/macaron_clea.pdf`,
  [PIX_DROIT_MAITRE_CERTIF]: `${__dirname}/files/stickers/macaron_droit_maitre.pdf`,
  [PIX_DROIT_EXPERT_CERTIF]: `${__dirname}/files/stickers/macaron_droit_expert.pdf`,
  [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE]: `${__dirname}/files/stickers/macaron_edu_2nd_initie.pdf`,
  [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME]: `${__dirname}/files/stickers/macaron_edu_2nd_confirme.pdf`,
  [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME]: `${__dirname}/files/stickers/macaron_edu_2nd_confirme.pdf`,
  [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE]: `${__dirname}/files/stickers/macaron_edu_2nd_avance.pdf`,
  [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT]: `${__dirname}/files/stickers/macaron_edu_2nd_expert.pdf`,
  [PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE]: `${__dirname}/files/stickers/macaron_edu_1er_initie.pdf`,
  [PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME]: `${__dirname}/files/stickers/macaron_edu_1er_confirme.pdf`,
  [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME]: `${__dirname}/files/stickers/macaron_edu_1er_confirme.pdf`,
  [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE]: `${__dirname}/files/stickers/macaron_edu_1er_avance.pdf`,
  [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT]: `${__dirname}/files/stickers/macaron_edu_1er_expert.pdf`,
};

module.exports = function getImagePathByBadgeKey(badgeKey) {
  return STICKERS_PATH_BADGE_KEY[badgeKey];
};
