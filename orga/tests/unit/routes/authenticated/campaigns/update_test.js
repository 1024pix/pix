import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/update', function (hooks) {
  setupTest(hooks);

  test('should return members', async function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/campaigns/update');

    route.currentUser = { organization: { id: 123 } };

    const members = Symbol('list of members sorted by names');
    const campaign = EmberObject.create({ id: 6, ownerFirstName: 'Marc', ownerLastName: 'Dupont' });
    const findAllStub = sinon.stub();
    const findRecordStub = sinon.stub();
    const storeStub = {
      findAll: findAllStub.resolves(members),
      findRecord: findRecordStub.resolves(campaign),
    };
    route.store = storeStub;

    // when
    const params = { campaign_id: 6 };
    const result = await route.model(params);

    //then
    assert.strictEqual(result.membersSortedByFullName, members);
  });
});
