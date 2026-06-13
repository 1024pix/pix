import sinon from 'sinon';

import { pushEvents } from '../../../../../../src/certification/shared/application/api/event-api.js';
import { logger } from '../../../../../../src/shared/infrastructure/utils/logger.js';
import { knex } from '../../../../../tooling/databases.js';

describe('Certification | Shared | Integration | Application | API | Event', function () {
  let clock, warnSpy;
  const now = new Date('2023-02-02T00:00:00Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    warnSpy = sinon.spy(logger, 'warn');
  });

  afterEach(function () {
    clock.restore();
    sinon.restore();
    return knex('certification_events').truncate();
  });

  describe('#pushEvents', function () {
    it('persists several events', async function () {
      const dtoEvent1 = {
        candidateId: 123,
        name: 'SomeEvent',
        createdAt: new Date('2021-01-01T00:00:00Z'),
        metadata: { foo: 'bar' },
      };
      const dtoEvent2 = {
        candidateId: 156,
        name: 'SomeOtherEvent',
        createdAt: new Date('2023-02-02T00:00:00Z'),
        metadata: { foo2: 'bar2' },
      };

      await pushEvents([dtoEvent1, dtoEvent2]);

      // then
      const events = await knex('certification_events').select();
      sinon.assert.match(events, [
        {
          id: sinon.match.number,
          candidateId: 123,
          eventName: 'SomeEvent',
          createdAt: new Date('2021-01-01T00:00:00Z'),
          metadata: { foo: 'bar' },
        },
        {
          id: sinon.match.number,
          candidateId: 156,
          eventName: 'SomeOtherEvent',
          createdAt: new Date('2023-02-02T00:00:00Z'),
          metadata: { foo2: 'bar2' },
        },
      ]);
    });

    it('does nothing when no events given', async function () {
      await pushEvents([]);

      // then
      const events = await knex('certification_events').select();
      sinon.assert.match(events, []);
    });

    it('logs a warn when something goes wrong, without throwing', async function () {
      const dtoEvent1 = {
        candidateId: 123,
        name: 'SomeEvent',
        createdAt: new Date('2021-01-01T00:00:00Z'),
        metadata: { foo: 'bar' },
      };
      const dtoEvent2 = {
        candidateId: 'ILLEGAL_VALUE',
        name: 'SomeOtherEvent',
        createdAt: new Date('2023-02-02T00:00:00Z'),
        metadata: { foo2: 'bar2' },
      };

      await pushEvents([dtoEvent1, dtoEvent2]);

      // then
      const events = await knex('certification_events').select();
      sinon.assert.match(events, []);
      sinon.assert.calledWith(
        warnSpy,
        {
          event: 'certification-events-push',
          error: sinon.match.instanceOf(Error),
        },
        'Error while pushing certification events SomeEvent:123, SomeOtherEvent:ILLEGAL_VALUE',
      );
    });
  });
});
