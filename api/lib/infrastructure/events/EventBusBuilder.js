import { EventBus } from './EventBus.js';
import * as dependenciesBuilder from './EventHandlerDependenciesBuilder.js';
import { LogEvent } from './subscribers/LogEvent.js';
import { ScheduleParticipationResultCalculationJob } from './subscribers/ScheduleParticipationResultCalculationJob.js';
import { ScheduleSendSharedParticipationResultsToPoleEmploiJob } from './subscribers/ScheduleSendSharedParticipationResultsToPoleEmploiJob.js';
import { CreateAnonymizeUserLogJobScheduler } from './subscribers/audit-log/CreateAnonymizeUserLogJobScheduler.js';

const subscribers = [
  CreateAnonymizeUserLogJobScheduler,
  LogEvent,
  ScheduleParticipationResultCalculationJob,
  ScheduleSendSharedParticipationResultsToPoleEmploiJob,
];

function build() {
  const eventBus = new EventBus(dependenciesBuilder);

  subscribers.forEach((subscriberClass) => {
    eventBus.subscribe(subscriberClass.event, subscriberClass);
  });

  return eventBus;
}

export { build };
