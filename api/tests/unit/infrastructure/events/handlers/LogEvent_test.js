import { expect, sinon } from '../../../../test-helper.js';
import { Event } from '../../../../../lib/domain/events/Event.js';
import { LogEvent } from '../../../../../lib/infrastructure/events/subscribers/LogEvent.js';

describe('Unit | Infrastructure | Events | Handler | LogEvent', function () {
  describe('#handle', function () {
    it('logs the event', async function () {
      const monitoringTools = {
        logInfoWithCorrelationIds: sinon.stub(),
      };

      const event = new Event();
      const handler = new LogEvent({ monitoringTools });
      await handler.handle(event);

      expect(monitoringTools.logInfoWithCorrelationIds).to.have.been.calledWith({
        message: {
          type: 'EVENT_LOG',
          event: event.attributes,
        },
      });
    });
  });
});
