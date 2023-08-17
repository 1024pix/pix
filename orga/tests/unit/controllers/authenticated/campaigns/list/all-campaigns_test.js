import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/campaigns/list/all-campaigns', function (hooks) {
  setupIntlRenderingTest(hooks);
  let controller;

  const event = {
    preventDefault: sinon.stub(),
    stopPropagation: sinon.stub(),
  };

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/campaigns/list/all-campaigns');
  });

  module('#action goToCampaignPage', function () {
    test('it should call transitionTo with appropriate arguments', function (assert) {
      // given
      controller.router = { transitionTo: sinon.stub() };

      // when
      controller.send('goToCampaignPage', 123, event);

      // then
      assert.true(event.preventDefault.called);
      assert.true(controller.router.transitionTo.calledWith('authenticated.campaigns.campaign', 123));
    });
  });

  module('#action clearFilters', function () {
    test('it should set params to initial empty values', async function (assert) {
      // given
      controller.status = 'archived';
      controller.name = 'a name';
      controller.ownerName = 'an owner bame';
      controller.pageNumber = 4;

      // when
      await controller.clearFilters();

      // then
      assert.strictEqual(controller.status, null);
      assert.strictEqual(controller.name, null);
      assert.strictEqual(controller.ownerName, null);
      assert.strictEqual(controller.pageNumber, null);
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
});
