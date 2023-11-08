import { CertificationCpfCountry } from '../../../../src/certification/shared/domain/models/CertificationCpfCountry.js';

function buildCertificationCpfCountry({
  id = 123,
  code = '99139',
  commonName = 'PORTUGAL',
  originalName = 'PORTUGAL',
  matcher = 'AGLOPRTU',
} = {}) {
  return new CertificationCpfCountry({
    id,
    code,
    commonName,
    originalName,
    matcher,
  });
}

buildCertificationCpfCountry.FRANCE = function ({
  id = 123,
  code = '99100',
  commonName = 'FRANCE',
  originalName = 'FRANCE',
  matcher = 'ACEFNR',
} = {}) {
  return new CertificationCpfCountry({
    id,
    code,
    commonName,
    originalName,
    matcher,
  });
};

export { buildCertificationCpfCountry };
