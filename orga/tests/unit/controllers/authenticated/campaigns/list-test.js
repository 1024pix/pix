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
    const hasCampaign = controller.get('hasCampaign');

    // then
    assert.equal(hasCampaign, false);
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
    const hasCampaign = controller.get('hasCampaign');

    // then
    assert.equal(hasCampaign, true);
  });
});
