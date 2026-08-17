import { publishEvent } from '../../../../../src/shared/infrastructure/events/event-job-publisher-service.js';
import { expect } from '../../../../test-helper.js';

class FakeJobClient {
  static get instance() {
    return new FakeJobClient();
  }

  publishEvent(eventName, payload) {
    return `${eventName}-${payload.userId}-${payload.publishedByUserId}`;
  }
}

describe('Unit | Privacy | Domain | Services | event-job-publisher-service', function () {
  describe('#publishEvent', function () {
    it('publishes an event', async function () {
      // when
      const result = await publishEvent(
        'ANONYMIZE_USER_BY_ADMIN',
        { userId: 1234, publishedByUserId: 456 },
        FakeJobClient,
      );

      // then
      expect(result).to.equal('ANONYMIZE_USER_BY_ADMIN-1234-456');
    });
  });
});
