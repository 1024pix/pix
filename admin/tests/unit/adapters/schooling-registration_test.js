import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import ENV from 'pix-admin/config/environment';

module('Unit | Adapter | schooling-registration', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:schooling-registration');
  });

  module('#urlForDeleteRecord', function () {
    test('it performs the request to dissociate user from student', async function (assert) {
      // given
      const organizationLearner = { id: 12345 };
      const expectedUrl = `${ENV.APP.API_HOST}/api/admin/organization-learners/${organizationLearner.id}/association`;

      // when
      const url = adapter.urlForDeleteRecord(organizationLearner.id);

      // then
      assert.strictEqual(url, expectedUrl);
    });
  });
});
