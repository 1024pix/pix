import { AnonymizeUserEvent } from '../../../privacy/domain/events/AnonymizeUserEvent.js';
import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { refreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository.js';

export class RevokeAllAnonymizedUserTokenEventHandler extends EventHandler {
  constructor() {
    super('anonymize-user.refresh-tokens.event-queue', AnonymizeUserEvent.eventName);
  }

  async handle({ data, dependencies = { refreshTokenRepository } }) {
    const event = new AnonymizeUserEvent(data);
    await dependencies.refreshTokenRepository.revokeAllByUserId({ userId: event.userId });
  }
}
