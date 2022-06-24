const EventBus = require('./EventBus');
const dependenciesBuilder = require('./DependenciesBuilder');
const LogEvent = require('./subscribers/LogEvent');
const ScheduleParticipationResultCalculationJob = require('./subscribers/ScheduleParticipationResultCalculationJob');

const subscribers = [LogEvent, ScheduleParticipationResultCalculationJob];

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
