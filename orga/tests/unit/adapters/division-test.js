import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { resolve } from 'rsvp';

module('Unit | Adapters | division', (hooks) => {
  setupTest(hooks);

  let adapter;
  const organizationId = 2;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:division');
    const ajaxStub = () => resolve();
    adapter.ajax = ajaxStub;
  });

  module('#urlForQuery', () => {

    test('should build url from organizationId', async function(assert) {
      // when
      const query = { organizationId };
      const url = await adapter.urlForQuery(query);

      // then
      assert.equal(url.endsWith(`/organizations/${organizationId}/divisions`), true);
    });
  });
});
