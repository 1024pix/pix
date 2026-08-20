import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/catalogue/index', function (hooks) {
  setupTest(hooks);

  module('beforeModel', function () {
    test('it should redirect to catalogue all list page', async function (assert) {
      // given

      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');
      const route = this.owner.lookup('route:authenticated/catalogue/index');

      // when
      await route.beforeModel();

      //then
      assert.ok(routerService.replaceWith.calledOnceWithExactly('authenticated.catalogue.list', 'all'));
    });
  });
});
