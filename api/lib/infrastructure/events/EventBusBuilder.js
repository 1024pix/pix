import { ScheduleValidateOrganizationImportFileJob } from '../../../src/prescription/learner-management/infrastructure/events/subscribers/ScheduleValidateOrganizationImportFileJob.js';
import { EventBus } from './EventBus.js';
import * as dependenciesBuilder from './EventHandlerDependenciesBuilder.js';
import { LogEvent } from './subscribers/LogEvent.js';

const subscribers = [LogEvent, ScheduleValidateOrganizationImportFileJob];

function build() {
  const eventBus = new EventBus(dependenciesBuilder);

  subscribers.forEach((subscriberClass) => {
    eventBus.subscribe(subscriberClass.event, subscriberClass);
  });

  return eventBus;
}

export { build };
