import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | schooling-registration-user-association', function (hooks) {
  setupTest(hooks);

  test('serializers test', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('schooling-registration-user-association', {
      studentNumber: '2',
      firstName: null,
    });

    const recordSerialized = record.serialize();

    assert.equal(recordSerialized.data.attributes['student-number'], '2');
    assert.equal(recordSerialized.data.attributes['first-name'], undefined);
  });
});
