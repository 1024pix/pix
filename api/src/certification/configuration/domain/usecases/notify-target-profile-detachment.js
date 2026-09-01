import { TargetProfileDetachedEvent } from '../events/TargetProfileDetachedEvent.js';

export { notifyTargetProfileDetachment };

async function notifyTargetProfileDetachment({
  targetProfileIdToDetach,
  complementaryCertification,
  eventJobPublisherService,
}) {
  await eventJobPublisherService.publishEvent(
    new TargetProfileDetachedEvent({
      targetProfileIdToDetach,
      complementaryCertificationId: complementaryCertification.id,
      complementaryCertificationName: complementaryCertification.label,
    }),
  );
}
