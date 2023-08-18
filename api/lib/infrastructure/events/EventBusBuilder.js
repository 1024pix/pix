import { EventBus } from './EventBus.js';
import * as dependenciesBuilder from './EventHandlerDependenciesBuilder.js';
import { LogEvent } from './subscribers/LogEvent.js';
import { ScheduleParticipationResultCalculationJob } from './subscribers/ScheduleParticipationResultCalculationJob.js';
import { ScheduleSendSharedParticipationResultsToPoleEmploiJob } from './subscribers/ScheduleSendSharedParticipationResultsToPoleEmploiJob.js';
import { UserAnonymizedEventLoggingJobScheduler } from './subscribers/audit-log/UserAnonymizedEventLoggingJobScheduler.js';

const subscribers = [
  UserAnonymizedEventLoggingJobScheduler,
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
