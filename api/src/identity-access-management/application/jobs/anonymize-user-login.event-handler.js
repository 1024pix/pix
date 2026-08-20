import { AnonymizeUserEvent } from '../../../privacy/domain/events/AnonymizeUserEvent.js';
import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import * as userLoginRepository from '../../infrastructure/repositories/user-login-repository.js';

export class AnonymizeUserLoginEventHandler extends EventHandler {
  constructor() {
    super('anonymize-user.login.event-queue', AnonymizeUserEvent.eventName);
  }

  async handle({ data, dependencies = { userLoginRepository } }) {
    const event = new AnonymizeUserEvent(data);
    const userLogin = await dependencies.userLoginRepository.findByUserId(event.userId);
    if (!userLogin) return;

    const anonymizedUserLogin = userLogin.anonymize();

    await dependencies.userLoginRepository.update(anonymizedUserLogin, { preventUpdatedAt: true });
  }
}
