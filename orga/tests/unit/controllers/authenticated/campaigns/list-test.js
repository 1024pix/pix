import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ArrayProxy from '@ember/array/proxy';

module('Unit | Controller | authenticated/campaigns/list', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:authenticated/campaigns/list');
    assert.ok(controller);
  });

  test('it should sort the campaigns by alphabetical order', function(assert) {
    // given
    let controller = this.owner.lookup('controller:authenticated/campaigns/list');
    const campaign1 = { name: 'Cat' };
    const campaign2 = { name: 'Tiger' };
    const campaign3 = { name: 'Alligator' };
    const campaigns = ArrayProxy.create({
      content: [campaign1, campaign2, campaign3]
    });
    controller.set('model', campaigns);

    // when
    const sortedCampaigns = controller.get('sortedCampaigns');

    // then
    assert.equal(sortedCampaigns[0].name, 'Alligator');
    assert.equal(sortedCampaigns[1].name, 'Cat');
    assert.equal(sortedCampaigns[2].name, 'Tiger');

  });
});
