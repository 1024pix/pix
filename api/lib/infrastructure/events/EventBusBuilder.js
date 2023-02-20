import EventBus from './EventBus';
import dependenciesBuilder from './EventHandlerDependenciesBuilder';
import LogEvent from './subscribers/LogEvent';
import ScheduleParticipationResultCalculationJob from './subscribers/ScheduleParticipationResultCalculationJob';
import ScheduleSendSharedParticipationResultsToPoleEmploiJob from './subscribers/ScheduleSendSharedParticipationResultsToPoleEmploiJob';

const subscribers = [
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

export default {
  build,
};
