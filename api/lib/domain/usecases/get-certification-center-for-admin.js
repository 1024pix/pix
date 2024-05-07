import { CertificationCenterForAdminBis } from '../../../src/certification/enrolment/domain/models/CertificationCenterForAdminBis.js';

const getCertificationCenterForAdmin = function ({ id, centerRepository, dataProtectionOfficerRepository }) {
  const certificationCenter = centerRepository.getById({ id });
  const dataProtectionOfficer = dataProtectionOfficerRepository.get({ certificationCenterId: id });
  return new CertificationCenterForAdminBis({ certificationCenter, dataProtectionOfficer });
};

export { getCertificationCenterForAdmin };
