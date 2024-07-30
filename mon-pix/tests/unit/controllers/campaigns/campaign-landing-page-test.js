import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | Campaigns | Landing Page', function (hooks) {
  setupTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:campaigns/campaign-landing-page');
    controller.router = { transitionTo: sinon.stub() };
  });

  module('#startCampaignParticipation', function () {
    test('should redirect to route campaigns.access', function (assert) {
      // given
      controller.set('model', { code: 'konami' });

      // when
      controller.actions.startCampaignParticipation.call(controller);

      // then
      sinon.assert.calledWith(controller.router.transitionTo, 'campaigns.access', 'konami');
      assert.ok(true);
    });
  });
});
