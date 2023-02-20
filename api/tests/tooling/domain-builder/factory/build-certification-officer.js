import CertificationOfficer from '../../../../lib/domain/models/CertificationOfficer';

export default function buildCertificationOfficer({ id = 123, firstName = 'Dean', lastName = 'Winchester' } = {}) {
  return new CertificationOfficer({
    id,
    firstName,
    lastName,
  });
}
