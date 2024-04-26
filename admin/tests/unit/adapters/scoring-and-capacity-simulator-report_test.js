import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapter | scoring-and-capacity-simulator-report', function (hooks) {
  setupTest(hooks);

  module('#urlForQuery', function () {
    test('should trigger a request with the correct URL', async function (assert) {
      // given

      const adapter = this.owner.lookup('adapter:scoring-and-capacity-simulator-report');

      const url = adapter.urlForQuery();

      console.log({ url });

      // when / then
      assert.ok(url.endsWith('/simulate-score-and-capacity'));
    });
  });
});
