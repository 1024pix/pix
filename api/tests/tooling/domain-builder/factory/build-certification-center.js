import CertificationCenter from '../../../../lib/domain/models/CertificationCenter';

export default function buildCertificationCenter({
  id = 1,
  name = 'name',
  type = CertificationCenter.types.SUP,
  externalId = 'externalId',
  createdAt = new Date('2020-01-01'),
  updatedAt,
  habilitations = [],
} = {}) {
  return new CertificationCenter({
    id,
    name,
    type,
    externalId,
    updatedAt,
    createdAt,
    habilitations,
  });
}
