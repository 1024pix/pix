import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | organization-places-lot', function (hooks) {
  setupTest(hooks);

  test('it should return the right data in the PlacesLot model', function (assert) {
    const store = this.owner.lookup('service:store');
    const activationDate = new Date('2020-01-21');
    const expirationDate = new Date('2020-01-21');
    const model = store.createRecord('organization-places-lot', {
      count: 123,
      activationDate,
      expirationDate,
      status: 'PENDING',
    });
    assert.strictEqual(model.count, 123);
    assert.strictEqual(model.activationDate, activationDate);
    assert.strictEqual(model.expirationDate, expirationDate);
    assert.strictEqual(model.status, 'PENDING');
  });
});
