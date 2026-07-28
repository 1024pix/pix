import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/organizations/get/index', function (hooks) {
  setupTest(hooks);

  test('it should transition to details route before model', async function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/certification-centers/get/index');
    sinon.stub(route.router, 'replaceWith');

    // when
    await route.beforeModel();

    // then
    assert.ok(route.router.replaceWith.calledWith('authenticated.certification-centers.get.details'));
  });
});
