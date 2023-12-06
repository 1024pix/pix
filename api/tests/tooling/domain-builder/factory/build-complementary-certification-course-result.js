import { ComplementaryCertificationCourseResult } from './../../../../lib/domain/models/ComplementaryCertificationCourseResult.js';

const buildComplementaryCertificationCourseResult = function ({
  complementaryCertificationCourseId = 2,
  complementaryCertificationBadgeId = 2,
  acquired = false,
  source = ComplementaryCertificationCourseResult.sources.PIX,
  label,
} = {}) {
  return new ComplementaryCertificationCourseResult({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId,
    acquired,
    source,
    label,
  });
};

export { buildComplementaryCertificationCourseResult };
