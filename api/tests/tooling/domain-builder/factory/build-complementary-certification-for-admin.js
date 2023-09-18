import { ComplementaryCertificationForAdmin } from '../../../../src/certification/complementary-certification/domain/models/ComplementaryCertificationForAdmin.js';

const buildComplementaryCertificationForAdmin = function ({
  id = 1,
  label = 'Complementary certification name',
  hasExternalJury = true,
} = {}) {
  return new ComplementaryCertificationForAdmin({
    id,
    label,
    hasExternalJury,
  });
};

export { buildComplementaryCertificationForAdmin };
