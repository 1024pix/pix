import { expect, sinon } from '../../../../test-helper.js';
import { UserAnonymized } from '../../../../../lib/domain/events/UserAnonymized.js';
import { auditLoggerRepository } from '../../../../../lib/infrastructure/repositories/audit-logger-repository.js';
import { UserAnonymizedEventLoggingJobHandler } from '../../../../../lib/infrastructure/jobs/audit-log/UserAnonymizedEventLoggingJobHandler.js';

describe('Unit | Infrastructure | Jobs | audit-log | ', function () {
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

      const event = new UserAnonymized({
        userId: 1,
        updatedByUserId: 2,
        role: 'SUPER_ADMIN',
      });

      const userAnonymizedEventLoggingJobHandler = new UserAnonymizedEventLoggingJobHandler();

      // when
      await userAnonymizedEventLoggingJobHandler.handle(event);

      // then
      const expectedEvent = {
        userId: event.updatedByUserId.toString(),
        targetUserId: event.userId.toString(),
        role: 'SUPER_ADMIN',
        occurredAt: new Date(),
        action: 'ANONYMIZATION',
        client: 'PIX_ADMIN',
      };
      expect(auditLoggerRepository.logEvent).to.have.been.calledWithExactly(expectedEvent);
    });
  });
});
