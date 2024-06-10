import { UserAnonymized } from '../../../../../lib/domain/events/UserAnonymized.js';
import { UserAnonymizedBatchEventsLoggingJobHandler } from '../../../../../lib/infrastructure/jobs/audit-log/UserAnonymizedBatchEventsLoggingJobHandler.js';
import { auditLoggerRepository } from '../../../../../lib/infrastructure/repositories/audit-logger-repository.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Infrastructure | Jobs | audit-log | User anonymized batch events logging', function () {
  let clock;

  beforeEach(function () {
    const now = new Date('2023-08-18');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('#handle', function () {
    it('calls the user anonymized events', async function () {
      // given
      sinon.stub(auditLoggerRepository, 'logEvents').resolves();

      const event1 = new UserAnonymized({
        userId: 1,
        updatedByUserId: 2,
        role: 'SUPER_ADMIN',
      });

      const event2 = new UserAnonymized({
        userId: 2,
        updatedByUserId: 3,
        role: 'SUPER_ADMIN',
      });

      const userAnonymizedEventLoggingJobHandler = new UserAnonymizedBatchEventsLoggingJobHandler();

      // when
      await userAnonymizedEventLoggingJobHandler.handle([event1, event2]);

      // then
      const expectedEvent = [
        {
          userId: event1.updatedByUserId.toString(),
          targetUserId: event1.userId.toString(),
          role: 'SUPER_ADMIN',
          occurredAt: new Date(),
          action: 'ANONYMIZATION',
          client: 'PIX_ADMIN',
        },
        {
          userId: event2.updatedByUserId.toString(),
          targetUserId: event2.userId.toString(),
          role: 'SUPER_ADMIN',
          occurredAt: new Date(),
          action: 'ANONYMIZATION',
          client: 'PIX_ADMIN',
        },
      ];
      expect(auditLoggerRepository.logEvents).to.have.been.calledWithExactly(expectedEvent);
    });
  });
});
