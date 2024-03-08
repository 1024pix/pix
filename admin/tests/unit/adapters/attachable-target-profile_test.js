import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | attachable-target-profile', function (hooks) {
  setupTest(hooks);

  test('should send a GET request to search target profiles for complementary certification endpoint', async function (assert) {
    // given
    const adapter = this.owner.lookup('adapter:attachable-target-profile');
    adapter.ajax = sinon.stub().resolves();

    // when
    const url = await adapter.urlForQuery(undefined, 'attachable-target-profile');

    // then
    assert.ok(url.endsWith('api/admin/complementary-certifications/attachable-target-profiles'));
  });
});
