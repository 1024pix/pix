import ComplementaryCertificationHabilitation from '../../../../lib/domain/models/ComplementaryCertificationHabilitation';

export default function buildComplementaryCertificationHabilitation({
  id = 123,
  complementaryCertificationId = 456,
  certificationCenterId = 789,
} = {}) {
  return new ComplementaryCertificationHabilitation({
    id,
    complementaryCertificationId,
    certificationCenterId,
  });
}
