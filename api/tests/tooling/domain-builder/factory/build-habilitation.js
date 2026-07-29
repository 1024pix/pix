import { Habilitation } from '../../../../src/organizational-entities/domain/models/Habilitation.js';

const buildHabilitation = function ({
  complementaryCertificationId = 1,
  key = 'COMPLEMENTARY',
  label = 'Complementary label',
} = {}) {
  return new Habilitation({
    complementaryCertificationId,
    key,
    label,
  });
};

export { buildHabilitation };
