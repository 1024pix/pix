import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | login', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:login');
    assert.ok(route);
  });

  module('model', function (hooks) {
    hooks.afterEach(function () {
      sinon.restore();
    });

    test('loads ready identity providers', async function (assert) {
      // given
      const route = this.owner.lookup('route:login');

      sinon.stub(route.oidcIdentityProviders, 'loadReadyIdentityProviders');
      route.oidcIdentityProviders.loadReadyIdentityProviders.resolves();

      // when
      await route.model();

      // then
      assert.ok(route.oidcIdentityProviders.loadReadyIdentityProviders.called);
    });
  });
});
