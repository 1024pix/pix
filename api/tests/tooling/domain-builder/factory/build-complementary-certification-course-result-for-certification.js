import { ComplementaryCertificationCourseResultForJuryCertification } from '../../../../lib/domain/read-models/ComplementaryCertificationCourseResultForJuryCertification.js';

const buildComplementaryCertificationCourseResultForJuryCertification = function ({
  id = 1234,
  complementaryCertificationBadgeId = 99,
  acquired = true,
  label = 'label par défaut',
} = {}) {
  return new ComplementaryCertificationCourseResultForJuryCertification({
    id,
    complementaryCertificationBadgeId,
    acquired,
    label,
  });
};

export { buildComplementaryCertificationCourseResultForJuryCertification };
