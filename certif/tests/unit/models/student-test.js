import { module, test } from 'qunit';
import pick from 'lodash/pick';
import { setupTest } from 'ember-qunit';

module('Unit | Model | student', (hooks) => {
  setupTest(hooks);

  test('it creates a StudentModel', function(assert) {
    const store = this.owner.lookup('service:store');
    const data = {
      firstName: 'firstName',
      lastName: 'lastName',
      birthdate: new Date(),
      division: '4e',
    };
    const model = store.createRecord('student', data);
    assert.deepEqual(_pickModelData(data), _pickModelData(model));
  });

  function _pickModelData(student) {
    return pick(student, ['firstName', 'lastName', 'birthdate', 'division']);
  }
});
