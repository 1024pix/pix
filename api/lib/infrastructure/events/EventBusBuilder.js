import { EventBus } from './EventBus.js';
import * as dependenciesBuilder from './EventHandlerDependenciesBuilder.js';
import { LogEvent } from './subscribers/LogEvent.js';
import { ScheduleParticipationResultCalculationJob } from './subscribers/ScheduleParticipationResultCalculationJob.js';
import { ScheduleSendSharedParticipationResultsToPoleEmploiJob } from './subscribers/ScheduleSendSharedParticipationResultsToPoleEmploiJob.js';
import { ScheduleSetUserLastLoggedAtJob } from './subscribers/ScheduleSetUserLastLoggedAtJob.js';

const subscribers = [
  LogEvent,
  ScheduleParticipationResultCalculationJob,
  ScheduleSendSharedParticipationResultsToPoleEmploiJob,
  ScheduleSetUserLastLoggedAtJob,
];

function build() {
  const eventBus = new EventBus(dependenciesBuilder);

  subscribers.forEach((subscriberClass) => {
    eventBus.subscribe(subscriberClass.event, subscriberClass);
  });

  return eventBus;
}

export { build };
