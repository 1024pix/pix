import { withTransaction } from '../../../shared/domain/DomainTransaction.js';

export const archiveCertificationCenterData = withTransaction(async function ({
  certificationCenterId,
  archiveDate,
  archivedBy,
  certificationCenterMembershipRepository,
  certificationCenterInvitationRepository,
}) {
  await certificationCenterMembershipRepository.disableMembershipsByCertificationCenterId({
    certificationCenterId,
    updatedByUserId: archivedBy,
    disabledAt: archiveDate,
  });
  await certificationCenterInvitationRepository.markAsCancelledByCertificationCenter({
    certificationCenterId,
    updatedAt: archiveDate,
  });
});
