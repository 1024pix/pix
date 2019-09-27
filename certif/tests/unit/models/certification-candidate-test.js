import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | certification-candidate', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('certification-candidate', {}));
    assert.ok(model);
  });

  test('it should return the right data in the certification candidate model', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('certification-candidate', {
      id: 123,
      firstName: 'Henri',
      lastName: 'Dès',
      birthdate: '2001-09-11',
      birthplace: 'Castelnaudary',
      externalId: '123HENRI',
      extraTimePercentage: 0.2,
    }));
    assert.equal(model.id, 123);
    assert.equal(model.firstName, 'Henri');
    assert.equal(model.lastName, 'Dès');
    assert.equal(model.birthdate, '2001-09-11');
    assert.equal(model.birthplace, 'Castelnaudary');
    assert.equal(model.externalId, '123HENRI');
    assert.equal(model.extraTimePercentage, 0.2);
  });
});
