import { expect } from 'chai';

import { NotAnEventError } from '../../../../../src/shared/domain/errors.js';
import { publishEvent } from '../../../../../src/shared/infrastructure/jobs/event-job-publisher-service.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

class FakeJobClient {
  static get instance() {
    return new FakeJobClient();
  }

  publishEvent(eventName, payload, options) {
    return {
      eventName,
      payload,
      options,
    };
  }
}

class FakeEvent {
  constructor({ data }, options) {
    this.data = data;
    this.options = options;
  }

  static get eventName() {
    return 'TEST.eventName';
  }

  get eventName() {
    return FakeEvent.eventName;
  }

  get payload() {
    return {
      data: this.data,
    };
  }
}

describe('Unit | Privacy | Domain | Services | event-job-publisher-service', function () {
  describe('#publishEvent', function () {
    it('publishes an event', async function () {
      const event = new FakeEvent({ data: 456 });
      const result = await publishEvent(event, FakeJobClient);

      expect(result.eventName).to.equal(event.eventName);
      expect(result.payload).to.deep.equal({
        data: 456,
        correlationContext: {
          jobId: null,
          'pix-metadata': null,
          request_id: null,
          scriptId: null,
          user_id: null,
        },
        openTelemetryContext: undefined,
      });
    });

    it('throw an Error when trying to publish something that not an event class', async function () {
      const notAnEvent = 123;
      const err = await catchErr(publishEvent)(notAnEvent, FakeJobClient);
      expect(err).to.be.an.instanceof(NotAnEventError);
      expect(err.message).to.equal('Number is not an Event class');
    });

    it('calls `publishEvent` with default options', async function () {
      const event = new FakeEvent({ data: 456 });
      const result = await publishEvent(event, FakeJobClient);

      expect(result.options).to.deep.equal({
        expireInSeconds: 72000,
        retryLimit: 2,
        retryDelay: 30,
        retryBackoff: true,
        priority: 0,
      });
    });

    it('calls `publishEvent` with custom options', async function () {
      const options = {
        retryLimit: 4,
        retryDelay: 5,
        priority: 9,
      };
      const event = new FakeEvent({ data: 456 }, options);
      const result = await publishEvent(event, FakeJobClient);

      expect(result.options).to.deep.equal({
        expireInSeconds: 72000,
        retryLimit: 4,
        retryDelay: 5,
        retryBackoff: true,
        priority: 9,
      });
    });
  });
});
