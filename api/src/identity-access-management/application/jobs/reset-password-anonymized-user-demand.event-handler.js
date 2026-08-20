import { AnonymizeUserEvent } from '../../../privacy/domain/events/AnonymizeUserEvent.js';
import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import * as resetPasswordDemandRepository from '../../infrastructure/repositories/reset-password-demand.repository.js';
import * as userRepository from '../../infrastructure/repositories/user.repository.js';

export class ResetPasswordAnonymizedUserDemandEventHandler extends EventHandler {
  constructor() {
    super(
      "ResetPasswordAnonymizedUserDemand",
      AnonymizeUserEvent.eventName,
    );
  }

  get isJobEnabled() {
    return false;
  }
  async handle({
    data,
    dependencies = { resetPasswordDemandRepository, userRepository },
  }) {
    const event = new AnonymizeUserEvent(data);
    const user = await dependencies.userRepository.get(event.userId);
    if (user.email) {
      await dependencies.resetPasswordDemandRepository.removeAllByEmail(
        user.email,
      );
    }
  }
}
