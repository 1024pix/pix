import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/campaigns/campaign/profiles', function(hooks) {
  setupTest(hooks);
  let controller;
  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/campaigns/campaign/profiles');
  });

  module('selectDivisions', function() {
    test('update the divisions', function(assert) {
      const fetchCampaign = sinon.stub();
      controller.set('fetchCampaign', fetchCampaign);
      controller.set('model', { id: 12 });
      controller.set('pageNumber', 11);

      controller.selectDivisions(['6eme']);

      assert.deepEqual(controller.divisions, ['6eme']);
      assert.deepEqual(controller.pageNumber, null);
    });
  });
});
