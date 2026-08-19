import { EventHandler } from "../../../shared/application/jobs/event-handler.js";
import { anonymizeGeneralizeDate } from "../../../shared/infrastructure/utils/date-utils.js";
import * as membershipRepository from "../../infrastructure/repositories/membership.repository.js";

export class AnonymizeMembershipEventHandler extends EventHandler {
  constructor() {
    super("AnonymizeMembershipJob", "ANONYMIZE_USER_BY_ADMIN");
  }

  async handle({ data, dependencies = { membershipRepository } }) {
    // Anonymize last accessed at
    const userMemberships = await dependencies.membershipRepository.findByUserId(data.userId);

    for (const membership of userMemberships) {
      const anonymizedMembershipLastAccessedAt = anonymizeGeneralizeDate(membership.lastAccessedAt);
      await dependencies.membershipRepository.updateLastAccessedAt({
        membershipId: membership.id,
        lastAccessedAt: anonymizedMembershipLastAccessedAt,
      });
    }

    // Disable Memberships
    await dependencies.membershipRepository.disableMembershipsByUserId({
      userId: data.userId,
      updatedByUserId: data.updatedByUserId,
    });
  }
}
