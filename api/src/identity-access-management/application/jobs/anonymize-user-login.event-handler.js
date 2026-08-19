import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { EVENTS } from '../../../shared/constants.js';
import * as userLoginRepository from '../../infrastructure/repositories/user-login-repository.js';

export class AnonymizeUserLoginEventHandler extends EventHandler {
  constructor() {
    super('AnonymizeUserLoginJob', EVENTS.ANONYMIZE_USER_BY_ADMIN);
  }

  async handle({ data, dependencies = { userLoginRepository } }) {
    const userLogin = await dependencies.userLoginRepository.findByUserId(data.userId);
    if (!userLogin) return;

    const anonymizedUserLogin = userLogin.anonymize();

    await dependencies.userLoginRepository.update(anonymizedUserLogin, { preventUpdatedAt: true });
  }
}
