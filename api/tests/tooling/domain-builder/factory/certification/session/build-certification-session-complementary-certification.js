import { ComplementaryCertification } from '../../../../../../src/certification/session/domain/models/ComplementaryCertification.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';

const buildCertificationSessionComplementaryCertification = function ({
  id = 123,
  label = 'JACKSON',
  key = ComplementaryCertificationKeys.CLEA,
} = {}) {
  return new ComplementaryCertification({
    id,
    label,
    key,
  });
};

export { buildCertificationSessionComplementaryCertification };
