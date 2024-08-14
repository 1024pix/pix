import { auditLoggerRepository } from '../../../../../../lib/infrastructure/repositories/audit-logger-repository.js';
import { UserAnonymizedEventLoggingJob } from '../../../../../../src/identity-access-management/domain/models/UserAnonymizedEventLoggingJob.js';
import { UserAnonymizedEventLoggingJobController } from '../../../../../../src/shared/application/jobs/audit-log/user-anonymized-event-logging-job-controller.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Jobs | audit-log | User anonymized event logging', function () {
  let clock;

  beforeEach(function () {
    const now = new Date('2023-08-18');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('#handle', function () {
    it('calls the user anonymized event', async function () {
      // given
      sinon.stub(auditLoggerRepository, 'logEvent').resolves();

      const payload = new UserAnonymizedEventLoggingJob({
        userId: 1,
        updatedByUserId: 2,
        role: 'SUPER_ADMIN',
      });

      const userAnonymizedEventLoggingJobHandler = new UserAnonymizedEventLoggingJobController();

      // when
      await userAnonymizedEventLoggingJobHandler.handle(payload);

      // then
      const expectedEvent = {
        userId: payload.updatedByUserId.toString(),
        targetUserId: payload.userId.toString(),
        role: 'SUPER_ADMIN',
        occurredAt: new Date(),
        action: 'ANONYMIZATION',
        client: 'PIX_ADMIN',
      };
      expect(auditLoggerRepository.logEvent).to.have.been.calledWithExactly(expectedEvent);
    });
  });
});
