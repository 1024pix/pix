import { CertificationCpfCity } from '../../../../src/certification/shared/domain/models/CertificationCpfCity.js';

function buildCertificationCpfCity({
  id = 123,
  name = 'PARIS 19',
  postalCode = '75019',
  INSEECode = '75119',
  isActualName = true,
} = {}) {
  return new CertificationCpfCity({
    id,
    name,
    postalCode,
    INSEECode,
    isActualName,
  });
}

export { buildCertificationCpfCity };
