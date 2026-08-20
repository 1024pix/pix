import { expect } from 'chai';

import { AnonymizeUserEvent } from '../../../../../src/privacy/domain/events/AnonymizeUserEvent.js';
import { NotAnEventError } from '../../../../../src/shared/domain/errors.js';
import { publishEvent } from '../../../../../src/shared/infrastructure/events/event-job-publisher-service.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

class FakeJobClient {
  static get instance() {
    return new FakeJobClient();
  }

  publishEvent(eventName, payload) {
    return `${eventName}-${payload.userId}-${payload.updatedByUserId}`;
  }
}

describe('Unit | Privacy | Domain | Services | event-job-publisher-service', function () {
  describe('#publishEvent', function () {
    it('publishes an event', async function () {
      const event = new AnonymizeUserEvent({ userId: 123, updatedByUserId: 456 });
      const result = await publishEvent(event, FakeJobClient);

      expect(result).to.equal(`${event.eventName}-123-456`);
    });

    it('throw an Error when trying to publish something that not an event class', async function () {
      const notAnEvent = 123;
      const err = await catchErr(publishEvent)(notAnEvent, FakeJobClient);
      expect(err).to.be.an.instanceof(NotAnEventError);
      expect(err.message).to.equal('Number is not an Event class');
    });
  });
});
