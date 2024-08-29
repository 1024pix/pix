import { ComplementaryCertificationBadge } from '../../../../../../src/certification/enrolment/domain/read-models/ComplementaryCertificationBadge.js';

export function buildComplementaryCertificationBadgeEnrolment({
  id = 123,
  label = 'someLabel',
  imageUrl = 'someImageUrl',
} = {}) {
  return new ComplementaryCertificationBadge({
    id,
    label,
    imageUrl,
  });
}
