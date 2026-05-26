import { setImmediate } from 'node:timers/promises';

import sinon from 'sinon';

import * as eventRepository from '../../../../../../src/certification/shared/infrastructure/repositories/event-repository.js';
import { featureToggles } from '../../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect } from '../../../../../test-helper.js';
import { knex } from '../../../../../tooling/databases.js';

describe('Certification | Shared | Integration | Repository | Event', function () {
  describe('#push', function () {
    context('when FT isEventSourcingCertificationEnabled is true', function () {
      it('persists the event in db', async function () {
        await featureToggles.set('isEventSourcingCertificationEnabled', true);
        await setImmediate();
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

    context('when FT isEventSourcingCertificationEnabled is false', function () {
      it('does nothing', async function () {
        await featureToggles.set('isEventSourcingCertificationEnabled', false);
        await setImmediate();
        const event = {
          name: 'SomeEvent',
          candidateId: 123,
          createdAt: new Date('2021-01-01T00:00:00Z'),
          metadata: { foo: 'bar' },
        };

        await eventRepository.push(event);

        // then
        const events = await knex('certification_events').select();
        expect(events).to.have.length(0);
      });
    });
  });
});
