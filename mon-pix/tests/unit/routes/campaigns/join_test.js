import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | Join', function (hooks) {
  setupTest(hooks);

  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:campaigns.join');
    route.modelFor = sinon.stub();
    route.router = { replaceWith: sinon.stub() };
  });

  module('#beforeModel', function () {
    test('should redirect to entry point when /rejoindre is directly set in the url', async function (assert) {
      //when
      await route.beforeModel({ from: null });

      //then
      assert.expect(0);
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.entry-point');
    });

    test('should continue en entrance route when from is set', async function (assert) {
      //when
      await route.beforeModel({ from: 'campaigns.entry-point' });

      //then
      assert.expect(0);
      sinon.assert.notCalled(route.router.replaceWith);
    });

    test('should redefine routeIfAlreadyAuthenticated', async function (assert) {
      // given

      //when
      await route.beforeModel({ from: 'campaigns.entry-point' });

      //then
      assert.equal(route.routeIfAlreadyAuthenticated, 'campaigns.access');
    });
  });

  module('#model', function () {
    test('should load model', async function (assert) {
      //when
      await route.model();

      //then
      assert.expect(0);
      sinon.assert.calledWith(route.modelFor, 'campaigns');
    });
  });
});
