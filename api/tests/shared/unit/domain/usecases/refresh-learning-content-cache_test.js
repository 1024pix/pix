import { LcmsRefreshCacheJob } from '../../../../../src/shared/domain/models/LcmsRefreshCacheJob.js';
import { refreshLearningContentCache } from '../../../../../src/shared/domain/usecases/refresh-learning-content-cache.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Usecases | Refresh Learning Content Cache', function () {
  it('should use repository to schedule refresh job', async function () {
    // given
    const userId = 1234;
    const lcmsRefreshCacheJobRepository = { performAsync: sinon.stub() };

    // when
    await refreshLearningContentCache({ userId, lcmsRefreshCacheJobRepository });

    // then
    expect(lcmsRefreshCacheJobRepository.performAsync).to.have.been.calledOnce;
    expect(lcmsRefreshCacheJobRepository.performAsync).to.have.been.calledWithExactly(
      new LcmsRefreshCacheJob({ userId }),
    );
  });
});
