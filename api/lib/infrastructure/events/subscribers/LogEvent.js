const Event = require('../../../domain/events/CampaignParticipationResultsShared.js');

class LogEvent {
  constructor({ monitoringTools }) {
    this.monitoringTools = monitoringTools;
  }

  async handle(event) {
    this.monitoringTools.logInfoWithCorrelationIds({
      message: {
        type: 'EVENT_LOG',
        event: event.attributes,
      },
    });
  }
}

LogEvent.event = Event;

module.exports = LogEvent;
