const { CERTIF_CENTER_ID } = require('./certification-centers-builder');
const { PIX_CERTIF_USER_ID } = require('./users');

module.exports = function certificationCenterMembershipsBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildCertificationCenterMembership({ userId: PIX_CERTIF_USER_ID, certificationCenterId: CERTIF_CENTER_ID });
};
