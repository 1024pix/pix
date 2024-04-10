import { ScheduleImportOrganizationLearnersJob } from '../../../src/prescription/learner-management/infrastructure/events/subscribers/ScheduleImportOrganizationLearnersJob.js';
import { EventBus } from './EventBus.js';
import * as dependenciesBuilder from './EventHandlerDependenciesBuilder.js';
import { UserAnonymizedEventLoggingJobScheduler } from './subscribers/audit-log/UserAnonymizedEventLoggingJobScheduler.js';
import { LogEvent } from './subscribers/LogEvent.js';
import { ScheduleParticipationResultCalculationJob } from './subscribers/ScheduleParticipationResultCalculationJob.js';
import { ScheduleSendSharedParticipationResultsToPoleEmploiJob } from './subscribers/ScheduleSendSharedParticipationResultsToPoleEmploiJob.js';

const subscribers = [
  UserAnonymizedEventLoggingJobScheduler,
  LogEvent,
  ScheduleParticipationResultCalculationJob,
  ScheduleSendSharedParticipationResultsToPoleEmploiJob,
  ScheduleImportOrganizationLearnersJob,
];

function build() {
  const eventBus = new EventBus(dependenciesBuilder);

  subscribers.forEach((subscriberClass) => {
    eventBus.subscribe(subscriberClass.event, subscriberClass);
  });

  return eventBus;
}

export { build };
