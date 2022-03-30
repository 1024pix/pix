const PixPlusEduCertificationScoring = require('../../../../lib/domain/models/PixPlusEduCertificationScoring');
const { PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME } = require('../../../../lib/domain/models/Badge').keys;
const buildReproducibilityRate = require('./build-reproducibility-rate');

module.exports = function buildPixPlusEduCertificationScoring({
  complementaryCertificationCourseId = 999,
  certificationCourseId = 123,
  certifiableBadgeKey = PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  reproducibilityRate = buildReproducibilityRate({ value: 100 }),
  hasAcquiredPixCertification = true,
} = {}) {
  return new PixPlusEduCertificationScoring({
    complementaryCertificationCourseId,
    certificationCourseId,
    certifiableBadgeKey,
    reproducibilityRate,
    hasAcquiredPixCertification,
  });
};
