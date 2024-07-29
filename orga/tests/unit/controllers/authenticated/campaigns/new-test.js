import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/campaigns/new', function (hooks) {
  setupIntlRenderingTest(hooks);
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/campaigns/new');
  });

  module('#action cancel', function () {
    module('when source is empty', function () {
      test('it should call transitionTo with appropriate arguments', function (assert) {
        // given
        controller.router = { transitionTo: sinon.stub() };

        // when
        controller.cancel();

        // then
        assert.true(controller.router.transitionTo.calledWith('authenticated.campaigns'));
      });
    });

    module('when source is filled with a campaign id', function () {
      test('it should call transitionTo with appropriate arguments', function (assert) {
        // given
        const source = Symbol('Source campaign id');
        controller.source = source;
        controller.router = { transitionTo: sinon.stub() };

        // when
        controller.cancel();

        // then
        assert.true(controller.router.transitionTo.calledWith('authenticated.campaigns.campaign.settings', source));
      });
    });
  });

  module('#action createCampaign', function () {
    test('it should call transitionTo with appropriate arguments', async function (assert) {
      // given
      controller.router = { transitionTo: sinon.stub() };
      controller.notifications = {
        clearAll: sinon.stub(),
      };
      controller.model = {
        campaign: {
          id: 1,
          save: sinon.stub().resolves(),
          setProperties: sinon.stub(),
        },
      };

      // when
      await controller.createCampaign({ name: 'ma campagne' });

      // then
      assert.true(controller.router.transitionTo.calledWith('authenticated.campaigns.campaign.settings', 1));
    });
  });
});
