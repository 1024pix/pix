import sinon from 'sinon';

import { RefreshLearningContentJob } from '../../../../../src/learning-content/domain/models/RefreshLearningContentJob.js';
import { scheduleRefreshLearningContentJob } from '../../../../../src/learning-content/domain/usecases/schedule-refresh-learning-content-job.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Usecases | Schedule Refresh Learning Content Job', function () {
  it('should use repository to schedule refresh job', async function () {
    // given
    const userId = 1234;
    const lcmsRefreshCacheJobRepository = { performAsync: sinon.stub() };

    // when
    await scheduleRefreshLearningContentJob({
      userId,
      refreshLearningContentJobRepository: lcmsRefreshCacheJobRepository,
    });

    // then
    expect(lcmsRefreshCacheJobRepository.performAsync).to.have.been.calledOnce;
    expect(lcmsRefreshCacheJobRepository.performAsync).to.have.been.calledWithExactly(
      new RefreshLearningContentJob({ userId }),
    );
  });
});
