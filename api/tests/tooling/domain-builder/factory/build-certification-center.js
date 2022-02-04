const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');

module.exports = function buildCertificationCenter({
  id = 1,
  name = 'name',
  type = CertificationCenter.types.SUP,
  externalId = 'externalId',
  isSupervisorAccessEnabled = false,
  createdAt = new Date('2020-01-01'),
  updatedAt,
  habilitations = [],
} = {}) {
  return new CertificationCenter({
    id,
    name,
    type,
    externalId,
    isSupervisorAccessEnabled,
    updatedAt,
    createdAt,
    habilitations,
  });
};
