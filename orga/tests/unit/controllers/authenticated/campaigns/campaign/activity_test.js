import { module, test } from 'qunit';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/campaigns/campaign/activity', function (hooks) {
  setupIntlRenderingTest(hooks);
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/campaigns/campaign/activity');
  });

  module('#action goToParticipantPage', function () {
    test('it should call transitionTo with appropriate arguments for profiles collection', function (assert) {
      // given
      controller.router = { transitionTo: sinon.stub() };
      controller.model = { campaign: { isTypeAssessment: false } };

      // when
      controller.send('goToParticipantPage', 123, 456);

      // then
      assert.true(controller.router.transitionTo.calledWith('authenticated.campaigns.participant-profile', 123, 456));
    });

    test('it should call transitionTo with appropriate arguments for assessment', function (assert) {
      // given
      controller.router = { transitionTo: sinon.stub() };
      controller.model = { campaign: { isTypeAssessment: true } };

      // when
      controller.send('goToParticipantPage', 123, 456);

      // then
      assert.true(
        controller.router.transitionTo.calledWith('authenticated.campaigns.participant-assessment', 123, 456)
      );
    });
  });

  module('#action resetFiltering', function (hooks) {
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
      controller.send('resetFiltering');

      // then
      assert.strictEqual(controller.pageNumber, null);
      assert.deepEqual(controller.divisions, []);
      assert.strictEqual(controller.status, null);
      assert.deepEqual(controller.groups, []);
      assert.strictEqual(controller.search, null);
    });
  });

  module('#action triggerFiltering', function (hooks) {
    hooks.beforeEach(function () {
      controller.model = { campaign: { isTypeAssessment: false } };
    });

    module('when division filter does not change', function () {
      test('it does not update divisions', function (assert) {
        // given
        controller.pageNumber = 5;
        controller.divisions = ['A2'];
        controller.status = 'SHARED';
        controller.search = 'Jean';

        // when
        controller.send('triggerFiltering', 'status', 'COMPLETED');

        // then
        assert.strictEqual(controller.pageNumber, null);
        assert.deepEqual(controller.divisions, ['A2']);
        assert.strictEqual(controller.status, 'COMPLETED');
        assert.strictEqual(controller.search, 'Jean');
      });
    });

    module('when groups filter does not change', function () {
      test('it does not update groups', function (assert) {
        // given
        controller.pageNumber = 5;
        controller.groups = ['A2'];
        controller.status = 'SHARED';
        controller.search = 'Jean';

        // when
        controller.send('triggerFiltering', 'status', 'COMPLETED');

        // then
        assert.strictEqual(controller.pageNumber, null);
        assert.deepEqual(controller.groups, ['A2']);
        assert.strictEqual(controller.status, 'COMPLETED');
        assert.strictEqual(controller.search, 'Jean');
      });
    });

    module('when status filter does not change', function () {
      test('it does not update status', function (assert) {
        // given
        controller.pageNumber = 5;
        controller.divisions = ['A2'];
        controller.status = 'SHARED';
        controller.search = 'Jean';

        // when
        controller.send('triggerFiltering', 'divisions', ['A1']);

        // then
        assert.strictEqual(controller.pageNumber, null);
        assert.deepEqual(controller.divisions, ['A1']);
        assert.strictEqual(controller.status, 'SHARED');
        assert.strictEqual(controller.search, 'Jean');
      });
    });

    module('when search filter does not change', function () {
      test('it does not update search', function (assert) {
        // given
        controller.pageNumber = 5;
        controller.divisions = ['A2'];
        controller.status = 'SHARED';
        controller.search = 'Jean';

        // when
        controller.send('triggerFiltering', 'divisions', ['A1']);

        // then
        assert.strictEqual(controller.pageNumber, null);
        assert.deepEqual(controller.divisions, ['A1']);
        assert.strictEqual(controller.status, 'SHARED');
        assert.strictEqual(controller.search, 'Jean');
      });
    });

    module('when status filter is reseted', function () {
      test('it updates status', function (assert) {
        // given
        controller.pageNumber = 5;
        controller.status = 'SHARED';

        // when
        controller.send('triggerFiltering', 'status', '');

        // then
        assert.strictEqual(controller.status, '');
      });
    });

    module('when search filter is changed', function () {
      test('it updates search', function (assert) {
        // given
        controller.pageNumber = 5;
        controller.search = 'Jean';

        // when
        controller.send('triggerFiltering', 'search', 'Paul');

        // then
        assert.strictEqual(controller.search, 'Paul');
      });
    });
  });

  module('#action deleteCampaignParticipant', function (hooks) {
    hooks.beforeEach(function () {
      controller.model = { campaign: { isTypeAssessment: false, id: 7 } };
    });

    module('when the deleteCampaignParticipant works', function () {
      test('it should called destroyRecord', async function (assert) {
        // given
        const campaignParticipantActivity = {
          id: 89,
          destroyRecord: sinon.stub(),
        };
        const campaignId = controller.model.campaign.id;
        controller.send = sinon.stub();
        // when
        await controller.deleteCampaignParticipant(campaignId, campaignParticipantActivity);

        //then
        assert.true(
          campaignParticipantActivity.destroyRecord.calledWith({
            adapterOptions: { campaignId, campaignParticipationId: campaignParticipantActivity.id },
          })
        );

        assert.true(controller.send.calledWith('refreshModel'));
      });
    });
  });
});
