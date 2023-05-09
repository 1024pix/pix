import { ComplementaryCertificationHabilitation } from '../../../../lib/domain/models/ComplementaryCertificationHabilitation.js';

const buildComplementaryCertificationHabilitation = function ({
  id = 123,
  complementaryCertificationId = 456,
  certificationCenterId = 789,
} = {}) {
  return new ComplementaryCertificationHabilitation({
    id,
    complementaryCertificationId,
    certificationCenterId,
  });
};

export { buildComplementaryCertificationHabilitation };
