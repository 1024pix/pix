import { LcmsRefreshCacheJobController } from '../../../../../src/shared/application/jobs/lcms-refresh-cache-job-controller.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Shared | Application | Jobs | LcmsRefreshCacheJobController', function () {
  describe('#handle', function () {
    it('should call usecase', async function () {
      const dependencies = {
        learningContentDatasource: {
          refreshLearningContentCacheRecords: sinon.stub(),
        },
      };
      // given
      const handler = new LcmsRefreshCacheJobController();

      // when
      await handler.handle({ dependencies });

      // then
      expect(dependencies.learningContentDatasource.refreshLearningContentCacheRecords).to.have.been.calledOnce;
    });
  });
});
