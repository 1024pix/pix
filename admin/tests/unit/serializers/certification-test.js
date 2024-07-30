import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Serializer | certification', function (hooks) {
  setupTest(hooks);

  test('it serializes records', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('certification', {});

    const serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
