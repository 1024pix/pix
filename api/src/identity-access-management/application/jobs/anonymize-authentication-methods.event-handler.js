import { AnonymizeUserEvent } from '../../../privacy/domain/events/AnonymizeUserEvent.js';
import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import * as authenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';

export class AnonymizeAuthenticationMethodsEventHandler extends EventHandler {
  constructor() {
    super('anonymize-user.authentication-methods.event-queue', AnonymizeUserEvent.eventName);
  }

  async handle({ data, dependencies = { authenticationMethodRepository } }) {
    const event = new AnonymizeUserEvent(data);
    await dependencies.authenticationMethodRepository.removeAllAuthenticationMethodsByUserId({ userId: event.userId });
  }
}
