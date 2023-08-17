import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | learning content cache', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:learning-content-cache');
    sinon.stub(adapter, 'ajax');
  });

  hooks.afterEach(function () {
    adapter.ajax.restore();
  });

  test('it should make AJAX call "PATCH /api/cache" in order to refresh learning content cache', async function (assert) {
    // given
    adapter.ajax.resolves();

    // when
    await adapter.refreshCacheEntries();

    // then
    sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/cache', 'PATCH');
    assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
  });
});
