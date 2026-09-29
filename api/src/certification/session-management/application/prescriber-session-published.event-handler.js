import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { SessionPublishedEvent } from '../../../shared/domain/events/SessionPublishedEvent.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';

export class PrescriberSessionPublishedEventHandler extends EventHandler {
  constructor() {
    super('session-published.prescriber.event-queue', SessionPublishedEvent.eventName);
  }

  async handle({
    data,
    dependencies = {
      logger,
      sendSessionResultsToReferers,
      sessionManagementRepository,
      certificationCenterRepository,
      mailService,
    },
  }) {
    const event = new SessionPublishedEvent(data);
    const sessionId = event.payload.sessionId;
    const hasSomeAcquired = await sessionManagementRepository.hasSomeAcquired({ id: sessionId });

    if (!hasSomeAcquired) {
      logger.debug(`No certifications in session ${sessionId}`);
      return;
    }

    const session = await dependencies.sessionManagementRepository.get({ id: sessionId });

    dependencies.sendSessionResultsToReferers({
      session,
      certificationCenterRepository,
      sessionManagementRepository,
      mailService,
    });
  }
}
