const EventBus = require('./EventBus.js');
const dependenciesBuilder = require('./EventHandlerDependenciesBuilder.js');
const LogEvent = require('./subscribers/LogEvent.js');
const ScheduleParticipationResultCalculationJob = require('./subscribers/ScheduleParticipationResultCalculationJob.js');
const ScheduleSendSharedParticipationResultsToPoleEmploiJob = require('./subscribers/ScheduleSendSharedParticipationResultsToPoleEmploiJob.js');

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
