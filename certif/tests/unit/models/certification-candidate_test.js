import { module, test } from 'qunit';
import pick from 'lodash/pick';
import { setupTest } from 'ember-qunit';

module('Unit | Model | certification-candidate', function(hooks) {
  setupTest(hooks);

  test('it creates a CertificationCandidate', function(assert) {
    const store = this.owner.lookup('service:store');
    const data = {
      firstName: 'Jean-Paul',
      lastName: 'Candidat',
      birthCity: 'Eu',
      birthCountry: 'France',
      email: 'jeanpauldeu@pix.fr',
      resultRecipientEmail: 'suric@animal.fr',
      externalId: '12345',
      birthdate: '2000-12-25',
      extraTimePercentage: 10,
      birthInseeCode: 76255,
      birthPostalCode: 76260,
      sex: 1,
    };

    const model = store.createRecord('certification-candidate', data);
    assert.deepEqual(_pickModelData(data), _pickModelData(model));
  });

  module('#get sexLabel', () => {
    test('it get "Homme" for sex code "M"', function(assert) {
      const store = this.owner.lookup('service:store');
      const data = {
        sex: 'M',
      };

      const model = store.createRecord('certification-candidate', data);

      assert.equal(model.sexLabel, 'Homme');
    });

    test('it get "Femme" for sex code "F"', function(assert) {
      const store = this.owner.lookup('service:store');
      const data = {
        sex: 'F',
      };

      const model = store.createRecord('certification-candidate', data);

      assert.equal(model.sexLabel, 'Femme');
    });

    test('it get nothing if no sex code', function(assert) {
      const store = this.owner.lookup('service:store');
      const data = {};

      const model = store.createRecord('certification-candidate', data);

      assert.equal(model.sexLabel, null);
    });
  });

  function _pickModelData(certificationCandidate) {
    return pick(certificationCandidate, [
      'firstName',
      'lastName',
      'birthCity',
      'birthCountry',
      'email',
      'resultRecipientEmail',
      'externalId',
      'birthdate',
      'extraTimePercentage',
      'birthInseeCode',
      'birthPostalCode',
      'sex',
    ]);
  }
});
