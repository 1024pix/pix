import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/campaigns/campaign/activity', function (hooks) {
  setupIntlRenderingTest(hooks);
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/campaigns/campaign/activity');
  });

  module('#goToParticipantPage', function () {
    test('it should call transitionTo with appropriate arguments for profiles collection', function (assert) {
      // given
      controller.router = { transitionTo: sinon.stub() };
      controller.model = { campaign: { isTypeAssessment: false } };

      // when
      controller.goToParticipantPage(123, 456);

      // then
      assert.true(controller.router.transitionTo.calledWith('authenticated.campaigns.participant-profile', 123, 456));
    });

    test('it should call transitionTo with appropriate arguments for assessment', function (assert) {
      // given
      controller.router = { transitionTo: sinon.stub() };
      controller.model = { campaign: { isTypeAssessment: true } };

      // when
      controller.goToParticipantPage(123, 456);

      // then
      assert.true(
        controller.router.transitionTo.calledWith('authenticated.campaigns.participant-assessment', 123, 456),
      );
    });
  });

  module('#resetFiltering', function (hooks) {
    hooks.beforeEach(function () {
      controller.model = { campaign: { isTypeAssessment: false } };
    });

    test('it reset all filters', function (assert) {
      // given
      controller.pageNumber = 5;
      controller.divisions = ['A2'];
      controller.status = 'SHARED';
      controller.groups = ['L3'];
      controller.search = 'Jean';

      // when
      controller.resetFiltering();

      // then
      assert.strictEqual(controller.pageNumber, null);
      assert.deepEqual(controller.divisions, []);
      assert.strictEqual(controller.status, null);
      assert.deepEqual(controller.groups, []);
      assert.strictEqual(controller.search, null);
    });
  });

  module('#triggerFiltering', function () {
    module('when the filters contain a valued field', function () {
      test('updates the value', async function (assert) {
        // given
        controller.someField = 'old-value';

        // when
        controller.triggerFiltering('someField', 'new-value');

        // then
        assert.strictEqual(controller.someField, 'new-value');
      });
    });

    module('when the filters contain an empty string', function () {
      test('clear the searched value', async function (assert) {
        // given
        controller.someField = 'old-value';

        // when
        controller.triggerFiltering('someField', '');

        // then
        assert.strictEqual(controller.someField, undefined);
      });
    });
  });

  module('#deleteCampaignParticipation', function (hooks) {
    hooks.beforeEach(function () {
      controller.model = { campaign: { isTypeAssessment: false, id: 7 } };
    });

    module('when the deleteCampaignParticipation works', function () {
      test('it should called destroyRecord', async function (assert) {
        // given
        const campaignParticipantActivity = {
          id: 89,
          destroyRecord: sinon.stub(),
        };
        const campaignId = controller.model.campaign.id;
        controller.send = sinon.stub();
        // when
        await controller.deleteCampaignParticipation(campaignId, campaignParticipantActivity);

        //then
        assert.true(
          campaignParticipantActivity.destroyRecord.calledWith({
            adapterOptions: { campaignId, campaignParticipationId: campaignParticipantActivity.id },
          }),
        );

        assert.true(controller.send.calledWith('refreshModel'));
      });
    });
  });
});
