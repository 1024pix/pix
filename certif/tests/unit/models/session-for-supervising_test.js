import { module, test } from 'qunit';
import pick from 'lodash/pick';
import { setupTest } from 'ember-qunit';

module('Unit | Model | session-for-supervising', function (hooks) {
  setupTest(hooks);

  test('it creates a SessionForSupervisingModel', function (assert) {
    const store = this.owner.lookup('service:store');
    const data = {
      certificationCenterName: 'Centre des chocolats',
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
    return pick(sessionForSupervising, ['certificationCenterName', 'examiner', 'room', 'accessCode', 'date', 'time']);
  }
});
