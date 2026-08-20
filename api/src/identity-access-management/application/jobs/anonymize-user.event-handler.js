import { AnonymizeUserEvent } from '../../../privacy/domain/events/AnonymizeUserEvent.js';
import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { resetPasswordDemandRepository } from '../../infrastructure/repositories/reset-password-demand.repository.js';
import * as userRepository from '../../infrastructure/repositories/user.repository.js';

export class AnonymizeUserEventHandler extends EventHandler {
  constructor() {
    super('anonymize-user.event-queue', AnonymizeUserEvent.eventName);
  }

  async handle({ data, dependencies = { userRepository, resetPasswordDemandRepository } }) {
    const event = new AnonymizeUserEvent(data);
    const user = await dependencies.userRepository.get(event.userId);

    if (user.email) {
      await dependencies.resetPasswordDemandRepository.removeAllByEmail(user.email);
    }

    const anonymizedUser = user.anonymize(event.updatedByUserId).mapToDatabaseDto();

    await dependencies.userRepository.updateUserDetailsForAdministration(
      { id: user.id, userAttributes: anonymizedUser },
      { preventUpdatedAt: true },
    );
  }
}
