import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import * as authenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';

export class AnonymizeAuthenticationMethodsEventHandler extends EventHandler {
  constructor() {
    super('AnonymizeAuthenticationMethodsJob', 'ANONYMIZE_USER_BY_ADMIN');
  }

  async handle({ data, dependencies = { authenticationMethodRepository } }) {
    await dependencies.authenticationMethodRepository.removeAllAuthenticationMethodsByUserId({ userId: data.userId });
  }
}
