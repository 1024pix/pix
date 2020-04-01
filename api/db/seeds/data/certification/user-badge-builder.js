const { BADGE_PIX_EMPLOI_ID  } = require('../pix-emploi-target-profile-builder');

const {
  CERTIF_REGULAR_USER1_ID,
} = require('./users');

function userBadgeBuilder({ databaseBuilder }) {

  const values = {
    userId: CERTIF_REGULAR_USER1_ID,
    badgeId: BADGE_PIX_EMPLOI_ID,
  };

  return databaseBuilder.databaseBuffer.pushInsertable({
    tableName: 'badge-acquisitions',
    values,
  });
}

module.exports = {
  userBadgeBuilder
};
