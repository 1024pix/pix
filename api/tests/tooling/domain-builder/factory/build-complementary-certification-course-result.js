const ComplementaryCertificationCourseResult = require('./../../../../lib/domain/models/ComplementaryCertificationCourseResult');

module.exports = function buildComplementaryCertificationCourseResult({
  certificationCourseId = 1,
  partnerKey = 'PARTNER_KEY',
  acquired = false,
} = {}) {
  return new ComplementaryCertificationCourseResult({
    certificationCourseId,
    partnerKey,
    acquired,
  });
};
