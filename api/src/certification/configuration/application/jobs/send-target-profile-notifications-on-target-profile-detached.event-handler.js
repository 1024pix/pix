import { EventHandler } from '../../../../shared/application/jobs/event-handler.js';
import { TargetProfileDetachedEvent } from '../../domain/events/TargetProfileDetachedEvent.js';
import { usecases } from '../../domain/usecases/index.js';

export class SendTargetProfileNotificationsOnTargetProfileDetachedEventHandler extends EventHandler {
  constructor() {
    super('SendTargetProfileNotificationsOnTargetProfileDetached', TargetProfileDetachedEvent.eventName);
  }

  async handle({ data, dependencies = { usecases } }) {
    const event = new TargetProfileDetachedEvent(data);
    const complementaryCertification = {
      id: event.complementaryCertificationId,
      label: event.complementaryCertificationName,
    };

    await dependencies.usecases.sendTargetProfileNotifications({
      targetProfileIdToDetach: event.targetProfileIdToDetach,
      complementaryCertification,
    });
  }
}
