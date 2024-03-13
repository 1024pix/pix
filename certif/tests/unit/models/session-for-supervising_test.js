import { setupTest } from 'ember-qunit';
import pick from 'lodash/pick';
import { module, test } from 'qunit';

module('Unit | Model | session-for-supervising', function (hooks) {
  setupTest(hooks);

  test('it creates a SessionForSupervisingModel', function (assert) {
    const store = this.owner.lookup('service:store');
    const data = {
      address: 'Centre de certification 1',
      examiner: 'Monsieur Marmotte',
      room: "Salle de mise en papier d'alu",
      accessCode: 'MARM01',
      date: '2022-10-17',
      time: '13:37',
    };
    const model = store.createRecord('session-for-supervising', data);
    assert.deepEqual(_pickModelData(data), _pickModelData(model));
  });

  function _pickModelData(sessionForSupervising) {
    return pick(sessionForSupervising, ['address', 'examiner', 'room', 'accessCode', 'date', 'time']);
  }
});
