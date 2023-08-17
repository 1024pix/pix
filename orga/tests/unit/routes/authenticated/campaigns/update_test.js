import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/update', function (hooks) {
  setupTest(hooks);

  test('should return members', async function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/campaigns/update');
    const store = this.owner.lookup('service:store');

    route.currentUser = { organization: { id: 123 } };

    const members = Symbol('list of members sorted by names');
    const campaign = EmberObject.create({ id: 6, ownerFirstName: 'Marc', ownerLastName: 'Dupont' });

    sinon.stub(store, 'findAll');
    sinon.stub(store, 'findRecord');
    store.findAll.resolves(members);
    store.findRecord.resolves(campaign);
    // when
    const params = { campaign_id: 6 };
    const result = await route.model(params);

    //then
    assert.strictEqual(result.membersSortedByFullName, members);
  });
});
