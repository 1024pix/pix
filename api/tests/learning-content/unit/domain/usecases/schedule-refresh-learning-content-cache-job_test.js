import { LcmsRefreshCacheJob } from '../../../../../src/learning-content/domain/models/LcmsRefreshCacheJob.js';
import { scheduleRefreshLearningContentCacheJob } from '../../../../../src/learning-content/domain/usecases/schedule-refresh-learning-content-cache-job.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Usecases | Schedule Refresh Learning Content Cache Job', function () {
  it('should use repository to schedule refresh job', async function () {
    // given
    const userId = 1234;
    const lcmsRefreshCacheJobRepository = { performAsync: sinon.stub() };

    // when
    await scheduleRefreshLearningContentCacheJob({ userId, lcmsRefreshCacheJobRepository });

    // then
    expect(lcmsRefreshCacheJobRepository.performAsync).to.have.been.calledOnce;
    expect(lcmsRefreshCacheJobRepository.performAsync).to.have.been.calledWithExactly(
      new LcmsRefreshCacheJob({ userId }),
    );
  });
});
