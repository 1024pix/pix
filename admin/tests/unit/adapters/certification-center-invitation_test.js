import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ENV from 'pix-admin/config/environment';

module('Unit | Adapter | certification-center-invitation', function (hooks) {
  setupTest(hooks);

  module('#urlForQuery', function () {
    test('should build url with certification center id as dynamic segment', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:certification-center-invitation');
      const query = { filter: { certificationCenterId: 7 } };

      // when
      const url = adapter.urlForQuery(query);

      // then
      assert.deepEqual(url, `${ENV.APP.API_HOST}/api/admin/certification-centers/7/invitations`);
    });
  });
});
