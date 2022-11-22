import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | student information', function (hooks) {
  setupTest(hooks);

  module('#buildURL', function () {
    test('should build recover account base URL when called with according requestType', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:student-information');
      const url = adapter.buildURL(123, 'student-information', null, 'account-recovery');

      // then
      assert.true(url.endsWith('/sco-organization-learners/'));
    });
  });
});
