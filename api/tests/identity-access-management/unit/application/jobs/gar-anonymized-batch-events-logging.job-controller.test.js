import { GarAnonymizedBatchEventsLoggingJobController } from '../../../../../src/identity-access-management/application/jobs/gar-anonymized-batch-events-logging.job-controller.js';
import { GarAnonymizedBatchEventsLoggingJob } from '../../../../../src/identity-access-management/domain/models/GarAnonymizedBatchEventsLoggingJob.js';
import { expect, sinon } from '../../../../test-helper.js';
describe('Unit | Prescription | Application | Jobs | garAnonymizedBatchEventsLoggingJobController', function () {
  describe('#handle', function () {
    let clock;
    const now = new Date('2022-12-25');

    beforeEach(function () {
      clock = sinon.useFakeTimers({
        now,
        toFake: ['Date'],
      });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('should call usecase', async function () {
      const dependencies = {
        auditLoggerRepository: {
          logEvents: sinon.stub(),
        },
      };

      // given
      const handler = new GarAnonymizedBatchEventsLoggingJobController();
      const data = new GarAnonymizedBatchEventsLoggingJob({
        userIds: [13, 42],
        updatedByUserId: 777,
        role: 'fun',
      });

      // when
      await handler.handle({ data, dependencies });

      // then
      expect(dependencies.auditLoggerRepository.logEvents).to.have.been.calledOnce;
      expect(dependencies.auditLoggerRepository.logEvents).to.have.been.calledWithExactly([
        {
          targetUserId: '13',
          userId: '777',
          role: 'fun',
          client: 'PIX_ADMIN',
          occurredAt: new Date(),
          action: 'ANONYMIZATION_GAR',
        },
        {
          targetUserId: '42',
          userId: '777',
          role: 'fun',
          client: 'PIX_ADMIN',
          occurredAt: new Date(),
          action: 'ANONYMIZATION_GAR',
        },
      ]);
    });
  });
});
