import { setupTest } from 'ember-qunit';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';

module('Unit | Adapters | organization-places-capacity', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:organization-places-capacity');
  });

  module('#urlForQueryRecord', function () {
    test('should build url with query params', async function (assert) {
      // given
      const expectedUrl = `${ENV.APP.API_HOST}/api/admin/organizations/1/places/capacity`;

      // when
      const url = adapter.urlForQueryRecord({ organizationId: 1 });

      // then
      assert.deepEqual(url, expectedUrl);
    });
  });
});
