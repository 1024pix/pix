import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ArrayProxy from '@ember/array/proxy';
import sinon from 'sinon';

module('Unit | Controller | authenticated/campaigns/list', function(hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/campaigns/list');
  });

  module('#get displayNoCampaignPanel', function() {

    test('it should know when there is no campaigns', function(assert) {
      // given
      const campaigns = ArrayProxy.create({
        content: []
      });
      controller.model = campaigns;

      // when
      const displayNoCampaignPanel = controller.displayNoCampaignPanel;

      // then
      assert.equal(displayNoCampaignPanel, true);
    });

    test('it should know when there are campaigns', function(assert) {
      // given
      const campaign1 = { name: 'Cat', createdAt: new Date('2018-08-07') };
      const campaigns = ArrayProxy.create({
        content: [campaign1]
      });
      controller.model = campaigns;

      // when
      const displayNoCampaignPanel = controller.displayNoCampaignPanel;

      // then
      assert.equal(displayNoCampaignPanel, false);
    });

    module('when there is a filter on campaigns name that does not match any campaign', function() {
      // given
      const filterName = 'Dog';
      const campaign1 = { name: 'Cat', createdAt: new Date('2018-08-07') };
      const campaigns = ArrayProxy.create({
        content: [campaign1]
      });

      test('it should display an empty table', function(assert) {
        controller.model = campaigns;
        controller.name = filterName;

        // when
        const displayNoCampaignPanel = controller.displayNoCampaignPanel;

        // then
        assert.equal(displayNoCampaignPanel, false);
      });
    });
  });

  module('#get isArchived', function() {

    module('when status is archived', function() {

      test('it should returns true', function(assert) {
        // given
        controller.status = 'archived';

        // when
        const isArchived = controller.isArchived;

        // then
        assert.equal(isArchived, true);
      });
    });

    module('when status is not archived', function() {

      test('it should returns false', function(assert) {
        // given
        controller.status = null;

        // when
        const isArchived = controller.isArchived;

        // then
        assert.equal(isArchived, false);
      });
    });
  });

  module('#updateFilters', function() {

    test('it should put value from pendingFilters into appropriate controller properties', function(assert) {
      // given
      controller.prop1 = 'someValue1';
      controller.prop2 = 'someValue2';
      controller.prop3 = 'someValue3';
      controller.pendingFilters = { prop1: 'someOtherValue1', prop2: 'someOtherValue2' };

      // when
      controller.updateFilters();

      // then
      assert.equal(controller.prop1, 'someOtherValue1');
      assert.equal(controller.prop2, 'someOtherValue2');
      assert.equal(controller.prop3, 'someValue3');
    });
  });

  module('#action updateCampaignStatus', function() {

    test('it should update controller status field', function(assert) {
      // given
      controller.status = 'someStatus';

      // when
      controller.send('updateCampaignStatus', 'someOtherStatus');

      // then
      assert.equal(controller.status, 'someOtherStatus');
    });
  });

  module('#action updateCampaignCreator', function() {

    test('it should update controller creatorId field', function(assert) {
      // given
      controller.creatorId = 'someCreatorId';

      // when
      controller.send('updateCampaignCreator', 'someOtherCreatorId');

      // then
      assert.equal(controller.creatorId, 'someOtherCreatorId');
    });
  });

  module('#action goToCampaignPage', function() {

    test('it should call transitionToRoute with appropriate arguments', function(assert) {
      // given
      controller.transitionToRoute = sinon.stub();

      // when
      controller.send('goToCampaignPage', 123);

      // then
      assert.equal(controller.transitionToRoute.calledWith('authenticated.campaigns.details', 123), true);
    });
  });
});
