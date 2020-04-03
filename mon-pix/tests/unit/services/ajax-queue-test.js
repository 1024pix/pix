import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import ENV from 'mon-pix/config/environment';

/* IMPORTANT NOTE :
The AjaxQueue service MUST be the same across all Pix applications. Thus, it seems redundant
to just copy this test file in each application test suite. That's why this is the only copy
of its unit test here in mon-pix test suite.
 */
describe('Unit | Service | ajax-queue', function() {
  setupTest();
  let ajaxQueueService;

  beforeEach(function() {
    ajaxQueueService = this.owner.lookup('service:ajax-queue');
  });

  describe('add()', function() {

    it('should execute the passed job', async function() {
      // given
      const expectedValue = 1;

      // when
      const actualValue = await ajaxQueueService.add(async () => { return expectedValue; });

      // then
      expect(actualValue).to.equal(expectedValue);
    });

    it('should execute concurrently as many jobs as indicated in settings file', async function() {
      // given
      let counter = 0, maxCounter = 0;
      async function job() {
        counter++;
        maxCounter = Math.max(counter, maxCounter);
        await Promise.resolve();
        counter--;
        return counter;
      }
      const maxJobsInQueue = ENV.APP.MAX_CONCURRENT_AJAX_CALLS;
      for (let i = 0; i < (2 * maxJobsInQueue); ++i) {
        ajaxQueueService.add(job);
      }

      // when
      await ajaxQueueService.add(job);

      // then
      expect(maxCounter).to.equal(maxJobsInQueue);
    });
  });
});
