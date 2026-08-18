import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { EVENTS } from '../../../shared/constants.js';
import { refreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository.js';

export class RevokeAllAnonymizedUserTokenEventHandler extends EventHandler {
  constructor() {
    super('RevokeAllAnonymizedUserTokenJob', EVENTS.ANONYMIZE_USER_REQUESTED);
  }

  async handle({ data, dependencies = { refreshTokenRepository } }) {
    await dependencies.refreshTokenRepository.revokeAllByUserId({ userId: data.userId });
  }
}
