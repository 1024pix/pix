import { withTransaction } from '../../../shared/domain/DomainTransaction.js';

const archiveCertificationCenter = withTransaction(async function ({
  certificationCenterId,
  userId,
  certificationCenterForAdminRepository,
  certificationCenterApiRepository,
}) {
  const archiveDate = new Date();
  await certificationCenterApiRepository.archiveCertificationCenterData({
    certificationCenterId,
    archivedBy: userId,
    archiveDate,
  });
  await certificationCenterForAdminRepository.archive({ certificationCenterId, archivedBy: userId, archiveDate });
});

export { archiveCertificationCenter };
