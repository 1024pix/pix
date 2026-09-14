import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { AnonymizeUserEvent } from '../../../shared/domain/events/AnonymizeUserEvent.js';
import { anonymizeGeneralizeDate } from '../../../shared/infrastructure/utils/date-utils.js';
import * as membershipRepository from '../../infrastructure/repositories/membership.repository.js';

export class AnonymizeMembershipEventHandler extends EventHandler {
  constructor() {
    super('anonymize-user.membership.event-queue', AnonymizeUserEvent.eventName);
  }

  async handle({ data, dependencies = { membershipRepository } }) {
    // Anonymize last accessed at
    const event = new AnonymizeUserEvent(data);
    const userMemberships = await dependencies.membershipRepository.findByUserId(event.userId);

    for (const membership of userMemberships) {
      const anonymizedMembershipLastAccessedAt = anonymizeGeneralizeDate(membership.lastAccessedAt);
      await dependencies.membershipRepository.updateLastAccessedAt({
        membershipId: membership.id,
        lastAccessedAt: anonymizedMembershipLastAccessedAt,
      });
    }

    // Disable Memberships
    await dependencies.membershipRepository.disableMembershipsByUserId({
      userId: event.userId,
      updatedByUserId: event.updatedByUserId,
    });
  }
}
