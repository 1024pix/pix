import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/users/get', function (hooks) {
  setupTest(hooks);

  module('beforeModel', function (hooks) {
    hooks.afterEach(function () {
      sinon.restore();
    });

    test('loads all available identity providers', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/users/get');

      sinon.stub(route.oidcIdentityProviders, 'loadAllAvailableIdentityProviders');
      route.oidcIdentityProviders.loadAllAvailableIdentityProviders.resolves();

      // when
      await route.beforeModel();

      // then
      assert.ok(route.oidcIdentityProviders.loadAllAvailableIdentityProviders.called);
    });
  });
});
