import { setImmediate } from 'node:timers/promises';

import sinon from 'sinon';

import * as eventRepository from '../../../../../../src/certification/shared/infrastructure/repositories/event-repository.js';
import { featureToggles } from '../../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect } from '../../../../../test-helper.js';
import { knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Shared | Integration | Repository | Event', function () {
  describe('#push', function () {
    context('when FT isEventSourcingCertificationEnabled is true', function () {
      it('persists the event in db', async function () {
        await featureToggles.set('isEventSourcingCertificationEnabled', true);
        await setImmediate();
        const event = domainBuilder.certification.shared.buildEvent({
          id: null,
          name: 'SomeEvent',
          candidateId: 123,
          createdAt: new Date('2021-01-01T00:00:00Z'),
          metadata: { foo: 'bar' },
        });

        await eventRepository.push([event]);

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

      it('allows to push multiple events in db', async function () {
        await featureToggles.set('isEventSourcingCertificationEnabled', true);
        await setImmediate();
        const event1 = domainBuilder.certification.shared.buildEvent({
          id: null,
          name: 'SomeEvent1',
          candidateId: 123,
          createdAt: new Date('2021-01-01T00:00:00Z'),
          metadata: { foo: 'bar' },
        });
        const event2 = domainBuilder.certification.shared.buildEvent({
          id: null,
          name: 'SomeEvent2',
          candidateId: 456,
          createdAt: new Date('2022-02-02T02:02:02Z'),
          metadata: { foo: 'bar2' },
        });

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
            createdAt: new Date('2022-02-02T02:02:02Z'),
            metadata: { foo: 'bar2' },
          },
        ]);
      });
    });

    context('when FT isEventSourcingCertificationEnabled is false', function () {
      it('does nothing', async function () {
        await featureToggles.set('isEventSourcingCertificationEnabled', false);
        await setImmediate();
        const event = domainBuilder.certification.shared.buildEvent({
          id: null,
          name: 'SomeEvent',
          candidateId: 123,
          createdAt: new Date('2021-01-01T00:00:00Z'),
          metadata: { foo: 'bar' },
        });

        await eventRepository.push([event]);

        // then
        const events = await knex('certification_events').select();
        expect(events).to.have.length(0);
      });
    });
  });
});
