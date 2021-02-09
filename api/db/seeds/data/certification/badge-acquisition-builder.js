const { PIX_EMPLOI_CLEA_BADGE_ID } = require('../badges-builder');
const {
  CERTIF_REGULAR_USER1_ID, CERTIF_SUCCESS_USER_ID,
} = require('./users');

function badgeAcquisitionBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildBadgeAcquisition({ userId: CERTIF_REGULAR_USER1_ID, badgeId: PIX_EMPLOI_CLEA_BADGE_ID });
  databaseBuilder.factory.buildBadgeAcquisition({ userId: CERTIF_SUCCESS_USER_ID, badgeId: PIX_EMPLOI_CLEA_BADGE_ID });
}

module.exports = {
  badgeAcquisitionBuilder,
};
