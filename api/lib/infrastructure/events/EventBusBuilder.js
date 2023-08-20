import { EventBus } from './EventBus.js';
import { UserAnonymizedEventLoggingJobScheduler } from './subscribers/audit-log/UserAnonymizedEventLoggingJobScheduler.js';

const subscribers = [UserAnonymizedEventLoggingJobScheduler];

function build() {
  const eventBus = new EventBus();

  subscribers.forEach((subscriberClass) => {
    eventBus.subscribe(subscriberClass.event, subscriberClass);
  });

  return eventBus;
}

export { build };
