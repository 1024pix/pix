const ComplementaryCertificationCourseResultsForJuryCertificationWithExternal = require('../../../../lib/domain/read-models/ComplementaryCertificationCourseResultsForJuryCertificationWithExternal');
const { PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE, PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT } =
  require('../../../../lib/domain/models/Badge').keys;

module.exports = function buildPixEduComplementaryCertificationCourseResultsForJuryCertificationWithExternal({
  complementaryCertificationCourseId = 456,
  pixPartnerKey = PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  pixAcquired = true,
  externalPartnerKey = PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
  externalAcquired = true,
} = {}) {
  return new ComplementaryCertificationCourseResultsForJuryCertificationWithExternal({
    complementaryCertificationCourseId,
    pixPartnerKey,
    pixAcquired,
    externalPartnerKey,
    externalAcquired,
  });
};
