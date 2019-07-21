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

  test('it should return the right data in the session model', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('session', {
      id: 123,
      firstName: 'Daniel',
      lastName: 'Balavoine',
      birthdate: '18/12/2000',
      birthCity: 'Bordeaux',
      birthProvince: '93',
      birthCountry: 'France',
      externalId: 'ABC123',
      extraTimePercentage: 10,
      session: '1',
    }));
    assert.equal(model.id, 123);
    assert.equal(model.firstName, 'Daniel');
    assert.equal(model.lastName, 'Balavoine');
    assert.equal(model.birthdate, '18/12/2000');
    assert.equal(model.birthCity, 'Bordeaux');
    assert.equal(model.birthProvince, '93');
    assert.equal(model.birthCountry, 'France');
    assert.equal(model.externalId, 'ABC123');
    assert.equal(model.extraTimePercentage, 10);
    assert.equal(model.session, '1');
  });
});
