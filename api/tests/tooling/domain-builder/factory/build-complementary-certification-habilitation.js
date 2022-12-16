const ComplementaryCertificationHabilitation = require('../../../../lib/domain/models/ComplementaryCertificationHabilitation');

module.exports = function buildComplementaryCertificationHabilitation({
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
