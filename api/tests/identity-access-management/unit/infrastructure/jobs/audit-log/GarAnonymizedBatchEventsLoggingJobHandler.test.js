import { auditLoggerRepository } from '../../../../../../lib/infrastructure/repositories/audit-logger-repository.js';
import { GarAuthenticationMethodAnonymized } from '../../../../../../src/identity-access-management/domain/models/GarAuthenticationMethodAnonymized.js';
import { GarAnonymizedBatchEventsLoggingJobHandler } from '../../../../../../src/identity-access-management/infrastructure/jobs/audit-log/GarAnonymizedBatchEventsLoggingJobHandler.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Identity Access Management | Infrastructure | Jobs | audit-log | User anonymized batch events logging', function () {
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

      const event = new GarAuthenticationMethodAnonymized({
        userIds: [1001, 1002, 1003],
        updatedByUserId: 1,
      });

      const GarAuthenticationMethodAnonymizedEventLoggingJobHandler = new GarAnonymizedBatchEventsLoggingJobHandler();

      // when
      await GarAuthenticationMethodAnonymizedEventLoggingJobHandler.handle(event);

      // then
      const expectedEvents = [
        {
          targetUserId: '1001',
          userId: '1',
          role: 'SUPER_ADMIN',
          occurredAt: new Date(),
          action: 'ANONYMIZATION_GAR',
          client: 'PIX_ADMIN',
        },
        {
          targetUserId: '1002',
          userId: '1',
          role: 'SUPER_ADMIN',
          occurredAt: new Date(),
          action: 'ANONYMIZATION_GAR',
          client: 'PIX_ADMIN',
        },
        {
          targetUserId: '1003',
          userId: '1',
          role: 'SUPER_ADMIN',
          occurredAt: new Date(),
          action: 'ANONYMIZATION_GAR',
          client: 'PIX_ADMIN',
        },
      ];
      expect(auditLoggerRepository.logEvents).to.have.been.calledWithExactly(expectedEvents);
    });
  });
});
