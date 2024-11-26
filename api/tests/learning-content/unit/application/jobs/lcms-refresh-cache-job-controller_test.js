import { LcmsRefreshCacheJobController } from '../../../../../src/learning-content/application/jobs/lcms-refresh-cache-job-controller.js';
import { usecases } from '../../../../../src/learning-content/domain/usecases/index.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Shared | Application | Jobs | LcmsRefreshCacheJobController', function () {
  describe('#handle', function () {
    it('should call usecase', async function () {
      // given
      sinon.stub(usecases, 'refreshLearningContentCache');
      const handler = new LcmsRefreshCacheJobController();

      // when
      await handler.handle();

      // then
      expect(usecases.refreshLearningContentCache).to.have.been.calledOnce;
    });
  });
});
