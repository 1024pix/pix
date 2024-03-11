import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapter | account recovery demand', function (hooks) {
  setupTest(hooks);

  module('#buildURL', function () {
    test('should build recovery account demand base URL when called with according requestType', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:account-recovery-demand');
      const url = adapter.buildURL(123, 'account-recovery-demand', null, 'send-account-recovery-demand');

      // then
      assert.true(url.endsWith('api/'));
    });
  });
});
