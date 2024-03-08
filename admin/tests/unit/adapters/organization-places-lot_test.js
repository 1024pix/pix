import { setupTest } from 'ember-qunit';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';

module('Unit | Adapters | organization-place', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:organization-place');
  });

  module('#urlForQuery', function () {
    test('should build url with query params', async function (assert) {
      // given
      const expectedUrl = `${ENV.APP.API_HOST}/api/admin/organizations/1/places`;

      // when
      const url = adapter.urlForQuery({ organizationId: 1 });

      // then
      assert.deepEqual(url, expectedUrl);
    });
  });

  module('#urlForCreateRecord', function () {
    test('should build url with adapterOptions', async function (assert) {
      // given
      const expectedUrl = `${ENV.APP.API_HOST}/api/admin/organizations/1/places`;
      // when
      const url = adapter.urlForCreateRecord({}, { adapterOptions: { organizationId: 1 } });
      // then
      assert.deepEqual(url, expectedUrl);
    });
  });
});
