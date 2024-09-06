import { ComplementaryCertificationCourseWithResults } from '../../../../../../src/certification/enrolment/domain/models/ComplementaryCertificationCourseWithResults.js';

const buildComplementaryCertificationCourseWithResultsEnrolment = function ({
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

export { buildComplementaryCertificationCourseWithResultsEnrolment };
