import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/administration/index', function (hooks) {
  setupTest(hooks);

  module('#beforeModel', function () {
    test('it should transition to common route', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/administration/index');
      sinon.stub(route.router, 'replaceWith');

      // when
      await route.beforeModel();

      // then
      assert.ok(route.router.replaceWith.calledWith('authenticated.administration.common'));
    });
  });
});
