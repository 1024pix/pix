import sinon from 'sinon';

import * as eventRepository from '../../../../../../src/certification/shared/infrastructure/repositories/event-repository.js';
import { knex } from '../../../../../tooling/databases.js';

describe('Certification | Shared | Integration | Repository | Event', function () {
  describe('#push', function () {
    it('should persist the event in db', async function () {
      const event = {
        name: 'SomeEvent',
        candidateId: 123,
        createdAt: new Date('2021-01-01T00:00:00Z'),
        metadata: { foo: 'bar' },
      };

      await eventRepository.push(event);

      // then
      const events = await knex('certification_events').select();
      sinon.assert.match(events, [
        {
          id: sinon.match.number,
          eventName: 'SomeEvent',
          candidateId: 123,
          createdAt: new Date('2021-01-01T00:00:00Z'),
          metadata: { foo: 'bar' },
        },
      ]);
    });
  });
});
