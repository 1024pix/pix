import ComplementaryCertificationCourseResult from './../../../../lib/domain/models/ComplementaryCertificationCourseResult';

export default function buildComplementaryCertificationCourseResult({
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
}
