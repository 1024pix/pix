import { refreshLearningContentCache } from '../../../../../src/shared/domain/usecases/refresh-learning-content-cache.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Usecases | Refresh Learning Content Cache', function () {
  it('should use repository to schedule reefresh job', async function () {
    // given
    const lcmsRefreshCacheJob = { schedule: sinon.stub() };

    // when
    await refreshLearningContentCache({ lcmsRefreshCacheJob });

    // then
    expect(lcmsRefreshCacheJob.schedule).to.have.been.calledOnce;
  });
});
