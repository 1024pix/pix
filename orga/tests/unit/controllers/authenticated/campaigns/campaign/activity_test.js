import { module, test } from 'qunit';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/campaigns/campaign/activity', function(hooks) {
  setupIntlRenderingTest(hooks);
  let controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/campaigns/campaign/activity');
  });

  module('#action goToParticipantPage', function() {

    test('it should call transitionToRoute with appropriate arguments for profiles collection', function(assert) {
      // given
      controller.transitionToRoute = sinon.stub();
      controller.model = { campaign: { isTypeAssessment: false } };

      // when
      controller.send('goToParticipantPage', 123, 456);

      // then
      assert.true(controller.transitionToRoute.calledWith('authenticated.campaigns.profile', 123, 456));
    });

    test('it should call transitionToRoute with appropriate arguments for assessment', function(assert) {
      // given
      controller.transitionToRoute = sinon.stub();
      controller.model = { campaign: { isTypeAssessment: true } };

      // when
      controller.send('goToParticipantPage', 123, 456);

      // then
      assert.true(controller.transitionToRoute.calledWith('authenticated.campaigns.participant-assessment', 123, 456));
    });
  });
});
