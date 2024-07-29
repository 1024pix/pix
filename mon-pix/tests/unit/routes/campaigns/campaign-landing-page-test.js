import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | campaign-landing-page', function (hooks) {
  setupTest(hooks);

  let route, campaign;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:campaigns.campaign-landing-page');
    route.modelFor = sinon.stub();
    route.router = { replaceWith: sinon.stub() };
  });

  module('#beforeModel', function () {
    test('should redirect to entry point when /entree is directly set in the url', async function (assert) {
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

  module('#afterModel', function () {
    test('should redirect to access route when campaign is for absolute novice', async function (assert) {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
        isForAbsoluteNovice: true,
      });

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.access', campaign.code);
      assert.ok(true);
    });
  });
});
