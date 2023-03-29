import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ENV from 'mon-pix/config/environment';

/* IMPORTANT NOTE :
The AjaxQueue service MUST be the same across all Pix applications. Thus, it seems redundant
to just copy this test file in each application test suite. That's why this is the only copy
of its unit test here in mon-pix test suite.
 */
module('Unit | Service | ajax-queue', function (hooks) {
  setupTest(hooks);
  let ajaxQueueService;

  hooks.beforeEach(function () {
    ajaxQueueService = this.owner.lookup('service:ajax-queue');
  });

  module('add()', function () {
    test('should execute the passed job', async function (assert) {
      // given
      const expectedValue = 1;

      // when
      const actualValue = await ajaxQueueService.add(async () => {
        return expectedValue;
      });

      // then
      assert.strictEqual(actualValue, expectedValue);
    });

    test('should execute concurrently as many jobs as indicated in settings file', async function (assert) {
      // given
      let counter = 0,
        maxCounter = 0;
      async function job() {
        counter++;
        maxCounter = Math.max(counter, maxCounter);
        await Promise.resolve();
        counter--;
        return counter;
      }
      const maxJobsInQueue = ENV.APP.MAX_CONCURRENT_AJAX_CALLS;
      for (let i = 0; i < 2 * maxJobsInQueue; ++i) {
        ajaxQueueService.add(job);
      }

      // when
      await ajaxQueueService.add(job);

      // then
      assert.strictEqual(maxCounter, maxJobsInQueue);
    });
  });
});
