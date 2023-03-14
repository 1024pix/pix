import { CertificationCenter, types } from '../../../../lib/domain/models/CertificationCenter.js';

const buildCertificationCenter = function ({
  id = 1,
  name = 'name',
  type = types.SUP,
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
};

export { buildCertificationCenter };
