import sinon from 'sinon';

import { GarAnonymizedBatchEventsLoggingJob } from '../../../../../../src/identity-access-management/domain/models/GarAnonymizedBatchEventsLoggingJob.js';
import { garAnonymizedBatchEventsLoggingJobRepository } from '../../../../../../src/identity-access-management/infrastructure/repositories/jobs/gar-anonymized-batch-events-logging-job-repository.js';
import { expect } from '../../../../../test-helper.js';

describe('Integration | Prescription | Application | Jobs | garAnonymizedBatchEventsLoggingJobRepository', function () {
  describe('#performAsync', function () {
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

    it('publish a job', async function () {
      // when
      const garAnonymizedBatchEventsLoggingJob = new GarAnonymizedBatchEventsLoggingJob({
        userIds: [13, 42],
        updatedByUserId: 777,
        role: 'fun',
      });

      await garAnonymizedBatchEventsLoggingJobRepository.performAsync(garAnonymizedBatchEventsLoggingJob);

      // then
      await expect(GarAnonymizedBatchEventsLoggingJob.name).to.have.been.performed.withJob({
        retrylimit: 10,
        retrydelay: 30,
        retrybackoff: true,
        data: {
          userIds: [13, 42],
          updatedByUserId: 777,
          role: 'fun',
          client: 'PIX_ADMIN',
          occurredAt: new Date().toISOString(),
        },
      });
    });
  });
});
