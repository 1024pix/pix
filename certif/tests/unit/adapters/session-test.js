import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | session', function(hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:session');
  });

  module('#urlForUpdateRecord', () => {
    test('should build update url from session id', async function(assert) {
      // when
      const options = { adapterOptions: { } };
      const url = await adapter.urlForUpdateRecord(123, 'session', options);

      assert.ok(url.endsWith('/sessions/123'));
    });

    test('should build specific url to finalization', async function(assert) {
      // when
      const options = { adapterOptions: { finalization: true } };
      const url = await adapter.urlForUpdateRecord(123, 'session', options);

      // then
      assert.ok(url.endsWith('/sessions/123/finalization'));
    });
  });

});
