const PartnerCertification = require('./../../../../lib/domain/models/PartnerCertification');

module.exports = function buildPartnerCertification({
  certificationCourseId = 1,
  partnerKey = 'PARTNER_KEY',
  acquired = false,
} = {}) {
  return new PartnerCertification({
    certificationCourseId,
    partnerKey,
    acquired,
  });
};
