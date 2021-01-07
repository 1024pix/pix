import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/campaigns/campaign/assessments', function(hooks) {
  setupTest(hooks);
  let controller;
  let debouncedUpdateFilters;
  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/campaigns/campaign/assessments');
    debouncedUpdateFilters = controller.debouncedUpdateFilters;
    controller.debouncedUpdateFilters = controller._updateFilters;
  });

  hooks.afterEach(function() {
    controller.debouncedUpdateFilters = debouncedUpdateFilters;
  });

  module('triggerFiltering', function() {
    test('update the filters', function(assert) {
      const fetchCampaign = sinon.stub();
      controller.set('fetchCampaign', fetchCampaign);
      controller.set('model', { id: 12 });
      controller.set('pageNumber', 11);

      controller.triggerFiltering({ divisions: ['6eme'] });

      assert.deepEqual(controller.divisions, ['6eme']);
    });
  });
});
