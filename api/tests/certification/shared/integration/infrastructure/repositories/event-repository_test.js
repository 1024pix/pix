import { setImmediate } from 'node:timers/promises';

import sinon from 'sinon';

import * as eventRepository from '../../../../../../src/certification/shared/infrastructure/repositories/event-repository.js';
import { featureToggles } from '../../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect } from '../../../../../test-helper.js';
import { knex } from '../../../../../tooling/databases.js';

describe('Certification | Shared | Integration | Repository | Event', function () {
  describe('#push', function () {
    context('when FT isEventSourcingCertificationEnabled is true', function () {
      it('persists the events in db', async function () {
        await featureToggles.set('isEventSourcingCertificationEnabled', true);
        await setImmediate();
        const event1 = {
          name: 'SomeEvent1',
          candidateId: 123,
          createdAt: new Date('2021-01-01T00:00:00Z'),
          metadata: { foo: 'bar' },
        };
        const event2 = {
          name: 'SomeEvent2',
          candidateId: 456,
          createdAt: new Date('2022-02-02T02:00:00Z'),
          metadata: { list: ['h', 'e', 'y'] },
        };

        await eventRepository.push([event1, event2]);

        const events = await knex('certification_events').select();
        sinon.assert.match(events, [
          {
            id: sinon.match.number,
            eventName: 'SomeEvent1',
            candidateId: 123,
            createdAt: new Date('2021-01-01T00:00:00Z'),
            metadata: { foo: 'bar' },
          },
          {
            id: sinon.match.number,
            eventName: 'SomeEvent2',
            candidateId: 456,
            createdAt: new Date('2022-02-02T02:00:00Z'),
            metadata: { list: ['h', 'e', 'y'] },
          },
        ]);
      });
    });

    context('when FT isEventSourcingCertificationEnabled is false', function () {
      it('does nothing', async function () {
        await featureToggles.set('isEventSourcingCertificationEnabled', false);
        await setImmediate();
        const event1 = {
          name: 'SomeEvent1',
          candidateId: 123,
          createdAt: new Date('2021-01-01T00:00:00Z'),
          metadata: { foo: 'bar' },
        };
        const event2 = {
          name: 'SomeEvent2',
          candidateId: 456,
          createdAt: new Date('2022-02-02T02:00:00Z'),
          metadata: { list: ['h', 'e', 'y'] },
        };

        await eventRepository.push([event1, event2]);

        const events = await knex('certification_events').select();
        expect(events).to.have.length(0);
      });
    });
  });
});
