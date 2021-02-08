const {
  SCO_CERTIF_CENTER_ID,
  PRO_CERTIF_CENTER_ID,
  SUP_CERTIF_CENTER_ID,
  NONE_CERTIF_CENTER_ID,
} = require('./certification-centers-builder');
const {
  PIX_SCO_CERTIF_USER_ID,
  PIX_PRO_CERTIF_USER_ID,
  PIX_SUP_CERTIF_USER_ID,
  PIX_NONE_CERTIF_USER_ID,
  CERTIF_REGULAR_USER1_ID,
} = require('./users');

module.exports = function certificationCenterMembershipsBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildCertificationCenterMembership({
    certificationCenterId: SCO_CERTIF_CENTER_ID,
    userId: PIX_SCO_CERTIF_USER_ID,
  });
  databaseBuilder.factory.buildCertificationCenterMembership({
    certificationCenterId: SCO_CERTIF_CENTER_ID,
    userId: CERTIF_REGULAR_USER1_ID,
  });

  databaseBuilder.factory.buildCertificationCenterMembership({ userId: PIX_PRO_CERTIF_USER_ID, certificationCenterId: PRO_CERTIF_CENTER_ID });
  databaseBuilder.factory.buildCertificationCenterMembership({ userId: PIX_SUP_CERTIF_USER_ID, certificationCenterId: SUP_CERTIF_CENTER_ID });
  databaseBuilder.factory.buildCertificationCenterMembership({ userId: PIX_NONE_CERTIF_USER_ID, certificationCenterId: NONE_CERTIF_CENTER_ID });
};
