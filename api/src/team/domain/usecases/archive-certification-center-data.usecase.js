import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import * as injectedCertificationCenterInvitationRepository from '../../infrastructure/repositories/certification-center-invitation-repository.js';
import { certificationCenterMembershipRepository as injectedCertificationCenterMembershipRepository } from '../../infrastructure/repositories/certification-center-membership.repository.js';

export const archiveCertificationCenterData = withTransaction(async function ({
  certificationCenterId,
  archiveDate,
  archivedBy,
  certificationCenterMembershipRepository = injectedCertificationCenterMembershipRepository,
  certificationCenterInvitationRepository = injectedCertificationCenterInvitationRepository,
} = {}) {
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
