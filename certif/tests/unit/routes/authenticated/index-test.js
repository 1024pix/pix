import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/index', function(hooks) {
  setupTest(hooks);

  test('it should redirects to authenticated.sessions', async function(assert) {
    // given
    const route = this.owner.lookup('route:authenticated/index');
    route.replaceWith = sinon.stub().resolves();

    // when
    await route.beforeModel();

    // then
    sinon.assert.calledWith(route.replaceWith, 'authenticated.sessions');
    assert.ok(route);
  });
});
