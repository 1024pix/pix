import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:authenticated');
    assert.ok(route);
  });

  module('model', function () {
    test('loads all available identity providers', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated');

      sinon.stub(route.oidcIdentityProviders, 'loadAllAvailableIdentityProviders');
      route.oidcIdentityProviders.loadAllAvailableIdentityProviders.resolves();

      // when
      await route.model();

      // then
      assert.ok(route.oidcIdentityProviders.loadAllAvailableIdentityProviders.called);
    });
  });
});
