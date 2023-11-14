import { ComplementaryCertificationCourseResultForJuryCertificationWithExternal } from '../../../../lib/domain/read-models/ComplementaryCertificationCourseResultForJuryCertificationWithExternal.js';

const buildComplementaryCertificationCourseResultForJuryCertificationWithExternal = function ({
  complementaryCertificationCourseId = 456,
  pixComplementaryCertificationBadgeId = 12,
  pixLabel = 'Pix+ Édu 1er degré Avancé',
  pixAcquired = true,
  pixLevel = 2,
  externalComplementaryCertificationBadgeId = 13,
  externalLabel = 'Pix+ Édu 1er degré Expert',
  externalAcquired = true,
  externalLevel = 1,
  allowedExternalLevels = [],
} = {}) {
  return new ComplementaryCertificationCourseResultForJuryCertificationWithExternal({
    complementaryCertificationCourseId,
    pixComplementaryCertificationBadgeId,
    pixLabel,
    pixAcquired,
    pixLevel,
    externalComplementaryCertificationBadgeId,
    externalLabel,
    externalAcquired,
    externalLevel,
    allowedExternalLevels,
  });
};

export { buildComplementaryCertificationCourseResultForJuryCertificationWithExternal };
