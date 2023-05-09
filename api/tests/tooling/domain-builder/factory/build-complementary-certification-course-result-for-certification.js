import { ComplementaryCertificationCourseResultForJuryCertification } from '../../../../lib/domain/read-models/ComplementaryCertificationCourseResultsForJuryCertification.js';

const buildComplementaryCertificationCourseResultForJuryCertification = function ({
  id = 1234,
  partnerKey = 'PARTNER_KEY',
  acquired = true,
  label = 'label par défaut',
} = {}) {
  return new ComplementaryCertificationCourseResultForJuryCertification({
    id,
    partnerKey,
    acquired,
    label,
  });
};

export { buildComplementaryCertificationCourseResultForJuryCertification };
