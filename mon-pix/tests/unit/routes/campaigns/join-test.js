import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Join', function (hooks) {
  setupTest(hooks);

  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:campaigns.join');
    route.modelFor = sinon.stub();
    route.router = { replaceWith: sinon.stub() };
  });

  module('#beforeModel', function (hooks) {
    hooks.beforeEach(function () {
      route = this.owner.lookup('route:campaigns.join');
      route.session = {
        prohibitAuthentication: sinon.stub(),
      };
      route.router = { replaceWith: sinon.stub() };
    });

    test('should redirect to entry point when /rejoindre is directly set in the url', async function (assert) {
      //when
      await route.beforeModel({ from: null });

      //then
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.entry-point');
      assert.ok(true);
    });

    test('should continue en entrance route when from is set', async function (assert) {
      //when
      await route.beforeModel({ from: 'campaigns.entry-point' });

      //then
      sinon.assert.notCalled(route.router.replaceWith);
      assert.ok(true);
    });

    test('should redefine routeIfAlreadyAuthenticated', async function (assert) {
      // given

      //when
      await route.beforeModel({ from: 'campaigns.entry-point' });

      //then
      assert.strictEqual(route.routeIfAlreadyAuthenticated, 'campaigns.access');
      sinon.assert.calledWith(route.session.prohibitAuthentication, 'authenticated.user-dashboard');
    });
  });

  module('#model', function () {
    test('should load model', async function (assert) {
      //when
      await route.model();

      //then
      sinon.assert.calledWith(route.modelFor, 'campaigns');
      assert.ok(true);
    });
  });
});
