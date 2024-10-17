import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | campaign', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#hasCustomResultPageButton', function () {
    test('returns true when there are a button url and button text', function (assert) {
      // given
      const campaignParams = {
        customResultPageButtonUrl: 'https://example.net',
        customResultPageButtonText: 'a result page button text',
      };

      // when
      const campaign = store.createRecord('campaign', campaignParams);

      // then
      assert.true(campaign.hasCustomResultPageButton);
    });
    test('returns false when there is a button url but no button text', function (assert) {
      // given
      const campaignParams = {
        customResultPageButtonUrl: 'https://example.net',
        customResultPageButtonText: null,
      };

      // when
      const campaign = store.createRecord('campaign', campaignParams);

      // then
      assert.false(campaign.hasCustomResultPageButton);
    });
    test('returns false when there is a button text but no button url', function (assert) {
      const campaignParams = {
        customResultPageButtonUrl: null,
        customResultPageButtonText: 'a result button text',
      };

      // when
      const campaign = store.createRecord('campaign', campaignParams);

      // then
      assert.false(campaign.hasCustomResultPageButton);
    });
  });
});
