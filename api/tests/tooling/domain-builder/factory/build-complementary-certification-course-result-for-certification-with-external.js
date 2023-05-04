import { ComplementaryCertificationCourseResultsForJuryCertificationWithExternal } from '../../../../lib/domain/read-models/ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.js';

const buildPixEduComplementaryCertificationCourseResultsForJuryCertificationWithExternal = function ({
  complementaryCertificationCourseId = 456,
  pixPartnerKey = 'PIX_PARTNER_KEY',
  pixLabel = 'Pix+ Édu 1er degré Avancé',
  pixAcquired = true,
  pixLevel = 2,
  externalPartnerKey = 'PIX_EXTERNAL_PARTNER_KEY',
  externalLabel = 'Pix+ Édu 1er degré Expert',
  externalAcquired = true,
  externalLevel = 1,
  allowedExternalLevels = [],
} = {}) {
  return new ComplementaryCertificationCourseResultsForJuryCertificationWithExternal({
    complementaryCertificationCourseId,
    pixPartnerKey,
    pixLabel,
    pixAcquired,
    pixLevel,
    externalPartnerKey,
    externalLabel,
    externalAcquired,
    externalLevel,
    allowedExternalLevels,
  });
};

export { buildPixEduComplementaryCertificationCourseResultsForJuryCertificationWithExternal };
