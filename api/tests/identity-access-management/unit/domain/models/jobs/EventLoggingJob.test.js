import { assert } from 'chai';

import { EventLoggingJob } from '../../../../../../src/identity-access-management/domain/models/jobs/EventLoggingJob.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Model | Jobs | EventLoggingJob', function () {
  const now = new Date(2024, 1, 1);
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#constructor', function () {
    it('creates an EventLoggingJob', async function () {
      // when
      const eventLoggingJob = new EventLoggingJob({
        client: 'PIX_APP',
        action: 'EMAIL_CHANGED',
        role: 'USER',
        userId: 123,
        targetUserId: 456,
        data: { foo: 'bar' },
        occurredAt: new Date(),
      });

      // then
      expect(eventLoggingJob.client).to.equal('PIX_APP');
      expect(eventLoggingJob.action).to.equal('EMAIL_CHANGED');
      expect(eventLoggingJob.role).to.equal('USER');
      expect(eventLoggingJob.userId).to.equal(123);
      expect(eventLoggingJob.targetUserId).to.equal(456);
      expect(eventLoggingJob.data).to.deep.equal({ foo: 'bar' });
      expect(eventLoggingJob.occurredAt).to.deep.equal(now);
    });

    context('when occurredAt is not defined', function () {
      it('set a default date for occurredAt', function () {
        // when
        const eventLoggingJob = new EventLoggingJob({
          client: 'PIX_APP',
          action: 'EMAIL_CHANGED',
          role: 'USER',
          userId: 123,
          targetUserId: 456,
        });

        // then
        expect(eventLoggingJob.targetUserId).to.equal(456);
        expect(eventLoggingJob.occurredAt).to.deep.equal(now);
      });
    });

    context('when required fields are missing', function () {
      it('throws an entity validation error', function () {
        try {
          // when
          new EventLoggingJob({});
          assert.fail();
        } catch (error) {
          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equal([
            { attribute: 'client', message: '"client" is required' },
            { attribute: 'action', message: '"action" is required' },
            { attribute: 'role', message: '"role" is required' },
            { attribute: 'userId', message: '"userId" is required' },
            { attribute: 'targetUserId', message: '"targetUserId" is required' },
          ]);
        }
      });
    });
  });
});
