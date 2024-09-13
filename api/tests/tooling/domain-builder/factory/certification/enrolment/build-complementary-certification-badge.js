import { ComplementaryCertificationBadge } from '../../../../../../src/certification/enrolment/domain/models/ComplementaryCertificationBadge.js';

const buildComplementaryCertificationBadge = function ({ id = 123, requiredPixScore = 100 } = {}) {
  return new ComplementaryCertificationBadge({
    id,
    requiredPixScore,
  });
};

export { buildComplementaryCertificationBadge };
