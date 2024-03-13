import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { resolve } from 'rsvp';

module('Unit | Adapters | division', function (hooks) {
  setupTest(hooks);

  let adapter;
  const certificationCenterId = 2;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:division');
    const ajaxStub = () => resolve();
    adapter.ajax = ajaxStub;
  });

  module('#urlForQuery', function () {
    test('should build url from certificationCenterId', async function (assert) {
      // when
      const query = { certificationCenterId };
      const url = await adapter.urlForQuery(query);

      // then
      assert.true(url.endsWith(`/certification-centers/${certificationCenterId}/divisions`));
    });
  });
});
