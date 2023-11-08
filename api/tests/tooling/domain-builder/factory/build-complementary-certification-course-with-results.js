import { ComplementaryCertificationCourseWithResults } from '../../../../lib/domain/models/ComplementaryCertificationCourseWithResults.js';

const buildComplementaryCertificationCourseWithResults = function ({
  id = 789,
  hasExternalJury = false,
  results = [],
  complementaryCertificationBadgeId = 100,
} = {}) {
  return new ComplementaryCertificationCourseWithResults({
    id,
    hasExternalJury,
    results,
    complementaryCertificationBadgeId,
  });
};

export { buildComplementaryCertificationCourseWithResults };
