const EventBus = require('./EventBus');
const dependenciesBuilder = require('./EventHandlerDependenciesBuilder');
const LogEvent = require('./subscribers/LogEvent');
const ScheduleParticipationResultCalculationJob = require('./subscribers/ScheduleParticipationResultCalculationJob');
const ScheduleSendSharedParticipationResultsToPoleEmploiJob = require('./subscribers/ScheduleSendSharedParticipationResultsToPoleEmploiJob');

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

module.exports = {
  build,
};
