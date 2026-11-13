import { expect } from 'chai';
import sinon from 'sinon';

import { config } from '../../../../../config/config.js';
import { RefreshLearningContentJobController } from '../../../../../src/learning-content/application/jobs/refresh-learning-content-job-controller.js';

describe('Unit | Learning Content | Application | Jobs | refresh-learning-content-job-controller', function () {
  context('when the refresh cron is set', function () {
    it('is enabled and scheduled with the configured cron', function () {
      // given
      sinon.stub(config.lcms, 'refreshJobCron').value('30 6 * * *');

      // when
      const controller = new RefreshLearningContentJobController();

      // then
      expect(controller.isJobEnabled).to.equal(true);
      expect(controller.jobCron).to.equal('30 6 * * *');
    });
  });

  context('when the refresh cron is not set', function () {
    it('stays enabled, so that refreshes requested on demand are still processed', function () {
      // given
      sinon.stub(config.lcms, 'refreshJobCron').value(null);

      // when
      const controller = new RefreshLearningContentJobController();

      // then
      expect(controller.isJobEnabled).to.equal(true);
      expect(controller.jobCron).to.equal(null);
    });
  });
});
