import { ComplementaryCertificationCourseResult } from './../../../../lib/domain/models/ComplementaryCertificationCourseResult.js';

const buildComplementaryCertificationCourseResult = function ({
  complementaryCertificationCourseId = 2,
  partnerKey = 'PARTNER_KEY',
  acquired = false,
  source = ComplementaryCertificationCourseResult.sources.PIX,
  label,
} = {}) {
  return new ComplementaryCertificationCourseResult({
    complementaryCertificationCourseId,
    partnerKey,
    acquired,
    source,
    label,
  });
};

export { buildComplementaryCertificationCourseResult };
