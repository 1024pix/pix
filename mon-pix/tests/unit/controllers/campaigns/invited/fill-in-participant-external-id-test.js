import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | Campaigns | Invited | FillInParticipantExternalId', function (hooks) {
  setupTest(hooks);

  const model = {
    code: 'CODECAMPAIGN',
  };
  const participantExternalId = 'matricule123';

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:campaigns/invited/fill-in-participant-external-id');
    controller.set('model', model);
    controller.router = { transitionTo: sinon.stub() };
  });

  module('#onSubmitParticipantExternalId', function () {
    test('should transition to route campaigns.entrance when participant external id is fulfilled', function (assert) {
      // when
      controller.actions.onSubmitParticipantExternalId.call(controller, participantExternalId);

      // then
      sinon.assert.calledWith(controller.router.transitionTo, 'campaigns.entrance', controller.model);
      assert.ok(true);
    });
  });

  module('#onCancel', function () {
    test('should transition to landing page', function (assert) {
      // when
      controller.actions.onCancel.call(controller);

      // then
      sinon.assert.calledWithExactly(
        controller.router.transitionTo,
        'campaigns.campaign-landing-page',
        controller.get('model.code'),
      );
      assert.ok(true);
    });
  });
});
