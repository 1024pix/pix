const ComplementaryCertificationCourseResult = require('./../../../../lib/domain/models/ComplementaryCertificationCourseResult');

module.exports = function buildComplementaryCertificationCourseResult({
  complementaryCertificationCourseId = 2,
  partnerKey = 'PARTNER_KEY',
  acquired = false,
  source = ComplementaryCertificationCourseResult.sources.PIX,
} = {}) {
  return new ComplementaryCertificationCourseResult({
    complementaryCertificationCourseId,
    partnerKey,
    acquired,
    source,
  });
};
