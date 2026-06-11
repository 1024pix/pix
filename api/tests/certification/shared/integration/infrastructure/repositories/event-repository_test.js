import sinon from 'sinon';

import * as eventRepository from '../../../../../../src/certification/shared/infrastructure/repositories/event-repository.js';
import { knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Shared | Integration | Repository | Event', function () {
  afterEach(function () {
    return knex('certification_events').truncate();
  });

  describe('#push', function () {
    it('should persist the event in db', async function () {
      const event = domainBuilder.certification.shared.buildEvent({
        id: null,
        name: 'SomeEvent',
        candidateId: 123,
        createdAt: new Date('2021-01-01T00:00:00Z'),
        metadata: { foo: 'bar' },
      });

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
