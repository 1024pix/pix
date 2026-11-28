import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { JobTeam } from '../../../shared/application/jobs/job-controller.js';
import { SessionPublishedEvent } from '../../../shared/domain/events/SessionPublishedEvent.ts';
import { addCorrelationInfo } from '../../../shared/infrastructure/execution-context-manager.js';
import { usecases } from '../domain/usecases/index.js';

export class SendResultsToPrescribersEventHandler extends EventHandler {
  constructor() {
    super('session-published.prescriber.event-queue', SessionPublishedEvent.eventName, {
      description:
        "À la publication d'une session, envoie par email aux prescripteurs des organisations concernées les résultats de certification de leurs élèves ou étudiants.",
      team: JobTeam.CERTIFICATION,
    });
  }

  async handle({ data }) {
    const event = new SessionPublishedEvent(data);
    const sessionId = event.payload.sessionId;
    addCorrelationInfo('sessionId', sessionId);
    await usecases.sendSessionResultsToPrescribers({ sessionId });
  }
}
