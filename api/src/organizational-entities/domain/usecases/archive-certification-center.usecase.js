import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { certificationCenterApiRepository as injectedCertificationCenterApiRepository } from '../../infrastructure/repositories/certification-center-api.repository.js';
import * as injectedCertificationCenterForAdminRepository from '../../infrastructure/repositories/certification-center-for-admin.repository.js';

const archiveCertificationCenter = withTransaction(async function ({
  certificationCenterId,
  userId,
  certificationCenterForAdminRepository = injectedCertificationCenterForAdminRepository,
  certificationCenterApiRepository = injectedCertificationCenterApiRepository,
} = {}) {
  const archiveDate = new Date();
  await certificationCenterApiRepository.archiveCertificationCenterData({
    certificationCenterId,
    archivedBy: userId,
    archiveDate,
  });
  await certificationCenterForAdminRepository.archive({ certificationCenterId, archivedBy: userId, archiveDate });
});

export { archiveCertificationCenter };
