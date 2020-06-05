import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapter | profile copy', function(hooks) {

  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:profile-copy');
    sinon.stub(adapter, 'ajax');
  });

  hooks.afterEach(function() {
    adapter.ajax.restore();
  });

  test('it should make AJAX call "POST /api/system/profile-copy" in order to copy a user profile', async function(assert) {
    // given
    const data = 'someData';
    adapter.ajax.resolves();

    // when
    await adapter.copyProfile(data);

    // then
    sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/system/profile-copy', 'POST', { data });
    assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
  });
});
