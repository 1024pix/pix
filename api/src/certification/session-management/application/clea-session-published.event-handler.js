import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { SessionPublishedEvent } from '../../../shared/domain/events/SessionPublishedEvent.js';
import * as sessionManagementRepository from '../infrastructure/repositories/session-management-repository.js';
import * as certificationCenterRepository from '../../shared/infrastructure/repositories/certification-center-repository.js';
import { mailService }  from '../domain/services/mail-service.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';

export class CleaSessionPublishedEventHandler extends EventHandler {
  constructor() {
    super('session-published.clea.event-queue', SessionPublishedEvent.eventName);
  }

  async handle({ data, dependencies = { logger, sessionManagementRepository, certificationCenterRepository, mailService } }) {
    const event = new SessionPublishedEvent(data);
    const sessionId = event.payload.sessionId
    const hasSomeCleaAcquired = await sessionManagementRepository.hasSomeCleaAcquired({ id: sessionId });

    if (!hasSomeCleaAcquired) {
      logger.debug(`No CLEA certifications in session ${sessionId}`);
      return;
    }

    const session = await dependencies.sessionManagementRepository.get({ id: sessionId });
    const refererEmails = await dependencies.certificationCenterRepository.getRefererEmails({ id: session.certificationCenterId });

    for (const refererEmail of refererEmails) {
      await dependencies.mailService.sendNotificationToCertificationCenterRefererForCleaResults({
        sessionId: session.id,
        email: refererEmail.email,
        sessionDate: session.date,
      });
    }
  }
}
