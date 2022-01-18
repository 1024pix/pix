const {
  PIX_EMPLOI_CLEA_BADGE_ID,
  PIX_EMPLOI_CLEA_BADGE_ID_V2,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME_BADGE_ID,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT_BADGE_ID,
} = require('../badges-builder');
const {
  CERTIF_REGULAR_USER1_ID,
  CERTIF_SUCCESS_USER_ID,
  CERTIF_FAILURE_USER_ID,
  CERTIF_EDU_FORMATION_INITIALE_USER_ID,
  CERTIF_EDU_FORMATION_CONTINUE_USER_ID,
} = require('./users');

function badgeAcquisitionBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildBadgeAcquisition({ userId: CERTIF_REGULAR_USER1_ID, badgeId: PIX_EMPLOI_CLEA_BADGE_ID });
  databaseBuilder.factory.buildBadgeAcquisition({ userId: CERTIF_SUCCESS_USER_ID, badgeId: PIX_EMPLOI_CLEA_BADGE_ID });
  databaseBuilder.factory.buildBadgeAcquisition({ userId: CERTIF_FAILURE_USER_ID, badgeId: PIX_EMPLOI_CLEA_BADGE_ID_V2 });
  databaseBuilder.factory.buildBadgeAcquisition({
    userId: CERTIF_EDU_FORMATION_INITIALE_USER_ID,
    badgeId: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME_BADGE_ID,
  });
  databaseBuilder.factory.buildBadgeAcquisition({
    userId: CERTIF_EDU_FORMATION_CONTINUE_USER_ID,
    badgeId: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT_BADGE_ID,
  });
}

module.exports = {
  badgeAcquisitionBuilder,
};
