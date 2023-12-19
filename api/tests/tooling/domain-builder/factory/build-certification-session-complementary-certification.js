import { ComplementaryCertification } from '../../../../src/certification/session/domain/models/ComplementaryCertification.js';

const buildCertificationSessionComplementaryCertification = function ({
  id = 123,
  label = 'JACKSON',
  key = 'FIVE',
} = {}) {
  return new ComplementaryCertification({
    id,
    label,
    key,
  });
};

export { buildCertificationSessionComplementaryCertification };
