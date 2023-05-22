import { ComplementaryCertificationForSupervising } from '../../../../lib/domain/models/ComplementaryCertificationForSupervising.js';

const buildComplementaryCertificationForSupervising = function ({
  label = 'Complementary certification name',
  key = 'COMPLEMENTARY_CERTIFICATION_KEY',
  certificationExtraTime = 0,
} = {}) {
  return new ComplementaryCertificationForSupervising({
    label,
    key,
    certificationExtraTime,
  });
};

export { buildComplementaryCertificationForSupervising };
