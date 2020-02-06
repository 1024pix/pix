import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ArrayProxy from '@ember/array/proxy';

module('Unit | Controller | authenticated/campaigns/list', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const controller = this.owner.lookup('controller:authenticated/campaigns/list');
    assert.ok(controller);
  });

  test('it should know when there is no campaigns', function(assert) {
    // given
    const controller = this.owner.lookup('controller:authenticated/campaigns/list');
    const campaigns = ArrayProxy.create({
      content: []
    });
    controller.set('model', campaigns);

    // when
    const displayNoCampaignPanel = controller.get('displayNoCampaignPanel');

    // then
    assert.equal(displayNoCampaignPanel, true);
  });

  test('it should know when there are campaigns', function(assert) {
    // given
    const controller = this.owner.lookup('controller:authenticated/campaigns/list');
    const campaign1 = { name: 'Cat', createdAt: new Date('2018-08-07') };
    const campaigns = ArrayProxy.create({
      content: [campaign1]
    });
    controller.set('model', campaigns);

    // when
    const displayNoCampaignPanel = controller.get('displayNoCampaignPanel');

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
      const controller = this.owner.lookup('controller:authenticated/campaigns/list');
      controller.set('model', campaigns);
      controller.set('name', filterName);

      // when
      const displayNoCampaignPanel = controller.get('displayNoCampaignPanel');

      // then
      assert.equal(displayNoCampaignPanel, false);
    });
  });
});
