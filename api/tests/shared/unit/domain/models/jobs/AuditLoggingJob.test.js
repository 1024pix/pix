import { assert } from 'chai';
import sinon from 'sinon';

import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { AuditLoggingJob } from '../../../../../../src/shared/domain/models/jobs/AuditLoggingJob.js';

describe('Unit | Shared | Domain | Model | Jobs | AuditLoggingJob', function () {
  const now = new Date(2024, 1, 1);
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('AuditLoggingJob.forUser', function () {
    it('creates an AuditLoggingJob instance for a user', async function () {
      // when
      const auditLoggingJob = AuditLoggingJob.forUser({
        client: 'PIX_APP',
        action: 'EMAIL_CHANGED',
        role: 'USER',
        userId: 456,
        updatedByUserId: 123,
        data: { foo: 'bar' },
        occurredAt: new Date(),
      });

      // then
      expect(auditLoggingJob.client).to.equal('PIX_APP');
      expect(auditLoggingJob.action).to.equal('EMAIL_CHANGED');
      expect(auditLoggingJob.role).to.equal('USER');
      expect(auditLoggingJob.userId).to.equal(123);
      expect(auditLoggingJob.targetUserIds).to.deep.equal([456]);
      expect(auditLoggingJob.data).to.deep.equal({ foo: 'bar' });
      expect(auditLoggingJob.occurredAt).to.deep.equal(now);
    });
  });

  describe('AuditLoggingJob.forUsers', function () {
    it('creates an AuditLoggingJob instance for multiple users', async function () {
      // when
      const auditLoggingJob = AuditLoggingJob.forUsers({
        client: 'PIX_APP',
        action: 'EMAIL_CHANGED',
        role: 'USER',
        userIds: [456, 789],
        updatedByUserId: 123,
        data: { foo: 'bar' },
        occurredAt: new Date(),
      });

      // then
      expect(auditLoggingJob.client).to.equal('PIX_APP');
      expect(auditLoggingJob.action).to.equal('EMAIL_CHANGED');
      expect(auditLoggingJob.role).to.equal('USER');
      expect(auditLoggingJob.userId).to.equal(123);
      expect(auditLoggingJob.targetUserIds).to.deep.equal([456, 789]);
      expect(auditLoggingJob.data).to.deep.equal({ foo: 'bar' });
      expect(auditLoggingJob.occurredAt).to.deep.equal(now);
    });
  });

  describe('default values and errors', function () {
    context('when occurredAt is not defined', function () {
      it('set a default date for occurredAt', function () {
        // when
        const auditLoggingJob = AuditLoggingJob.forUser({
          client: 'PIX_APP',
          action: 'EMAIL_CHANGED',
          role: 'USER',
          userId: 456,
          updatedByUserId: 123,
        });

        // then
        expect(auditLoggingJob.occurredAt).to.deep.equal(now);
      });
    });

    context('when required fields are missing', function () {
      it('throws an entity validation error', function () {
        try {
          // when
          AuditLoggingJob.forUser({});
          assert.fail();
        } catch (error) {
          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equal([
            { attribute: 'client', message: '"client" is required' },
            { attribute: 'action', message: '"action" is required' },
            { attribute: 'role', message: '"role" is required' },
            { attribute: 'userId', message: '"userId" is required' },
            { attribute: 'targetUserIds', message: '"targetUserIds" must contain at least 1 items' },
          ]);
        }
      });
    });
  });
});
