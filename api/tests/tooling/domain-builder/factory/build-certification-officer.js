import { CertificationOfficer } from '../../../../lib/domain/models/CertificationOfficer.js';

const buildCertificationOfficer = function ({ id = 123, firstName = 'Dean', lastName = 'Winchester' } = {}) {
  return new CertificationOfficer({
    id,
    firstName,
    lastName,
  });
};

export { buildCertificationOfficer };
