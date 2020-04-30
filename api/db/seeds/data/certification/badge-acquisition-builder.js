const { BADGE_PIX_EMPLOI_ID  } = require('../pix-emploi-target-profile-builder');
const {
  CERTIF_REGULAR_USER1_ID, CERTIF_SUCCESS_USER_ID,
} = require('./users');

function badgeAcquisitionBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildBadgeAcquisition({ userId: CERTIF_REGULAR_USER1_ID, badgeId: BADGE_PIX_EMPLOI_ID });
  databaseBuilder.factory.buildBadgeAcquisition({ userId: CERTIF_SUCCESS_USER_ID, badgeId: BADGE_PIX_EMPLOI_ID });
}

module.exports = {
  badgeAcquisitionBuilder
};
