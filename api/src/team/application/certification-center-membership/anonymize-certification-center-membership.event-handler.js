import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { anonymizeGeneralizeDate } from '../../../shared/infrastructure/utils/date-utils.js';
import { certificationCenterMembershipRepository } from '../../infrastructure/repositories/certification-center-membership.repository.js';

export class AnonymizeCertificationCenterMembershipEventHandler extends EventHandler {
  constructor() {
    super('AnonymizeCertificationCenterMembershipJob', 'ANONYMIZE_USER_BY_ADMIN');
  }

  async handle({ data, dependencies = { certificationCenterMembershipRepository } }) {
    const certificationCenterMemberships = await dependencies.certificationCenterMembershipRepository.findByUserId(
      data.userId,
    );

    for (const membership of certificationCenterMemberships) {
      const anonymizedCertificationCenterMembershipLastAccessedAt = anonymizeGeneralizeDate(membership.lastAccessedAt);
      await dependencies.certificationCenterMembershipRepository.updateLastAccessedAt({
        certificationCenterMembershipId: membership.id,
        lastAccessedAt: anonymizedCertificationCenterMembershipLastAccessedAt,
      });
    }

    await dependencies.certificationCenterMembershipRepository.disableMembershipsByUserId({
      userId: data.userId,
      updatedByUserId: data.updatedByUserId,
    });
  }
}
