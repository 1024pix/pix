import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { JobTeam } from '../../../shared/application/jobs/job-controller.js';
import { AnonymizeUserEvent } from '../../../shared/domain/events/AnonymizeUserEvent.js';
import { anonymizeGeneralizeDate } from '../../../shared/infrastructure/utils/date-utils.ts';
import { certificationCenterMembershipRepository } from '../../infrastructure/repositories/certification-center-membership.repository.js';

export class AnonymizeCertificationCenterMembershipEventHandler extends EventHandler {
  constructor() {
    super('anonymize-user.certification-center-membership.event-queue', AnonymizeUserEvent.eventName, {
      description:
        "À l'anonymisation d'un utilisateur, généralise la date de dernier accès de ses rattachements à des centres de certification et les désactive.",
      team: JobTeam.ACQUISITION,
    });
  }

  async handle({ data, dependencies = { certificationCenterMembershipRepository } }) {
    const event = new AnonymizeUserEvent(data);
    const certificationCenterMemberships = await dependencies.certificationCenterMembershipRepository.findByUserId(
      event.userId,
    );

    for (const membership of certificationCenterMemberships) {
      const anonymizedCertificationCenterMembershipLastAccessedAt = anonymizeGeneralizeDate(membership.lastAccessedAt);
      await dependencies.certificationCenterMembershipRepository.updateLastAccessedAt({
        certificationCenterMembershipId: membership.id,
        lastAccessedAt: anonymizedCertificationCenterMembershipLastAccessedAt,
      });
    }

    await dependencies.certificationCenterMembershipRepository.disableMembershipsByUserId({
      userId: event.userId,
      updatedByUserId: event.updatedByUserId,
    });
  }
}
