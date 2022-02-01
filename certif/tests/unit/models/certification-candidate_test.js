import { module, test } from 'qunit';
import pick from 'lodash/pick';
import { setupTest } from 'ember-qunit';

module('Unit | Model | certification-candidate', function (hooks) {
  setupTest(hooks);

  test('it creates a CertificationCandidate', function (assert) {
    // given
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
    // when
    const model = store.createRecord('certification-candidate', data);
    // then
    assert.deepEqual(_pickModelData(data), _pickModelData(model));
  });

  module('#get sexLabel', () => {
    test('it get "Homme" for sex code "M"', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = {
        sex: 'M',
      };
      // when
      const model = store.createRecord('certification-candidate', data);
      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(model.sexLabel, 'Homme');
    });

    test('it get "Femme" for sex code "F"', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = {
        sex: 'F',
      };
      // when
      const model = store.createRecord('certification-candidate', data);
      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(model.sexLabel, 'Femme');
    });

    test('it get nothing if no sex code', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = {};
      // when
      const model = store.createRecord('certification-candidate', data);
      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(model.sexLabel, null);
    });
  });

  module('#get complementaryCertificationsList', () => {
    test('returns the complementary certification names as a string', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = {
        complementaryCertifications: [
          {
            id: 1,
            name: 'Pix+Edu',
          },
          {
            id: 2,
            name: 'Pix+Droit',
          },
        ],
      };
      // when
      const model = store.createRecord('certification-candidate', data);
      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(model.complementaryCertificationsList, 'Pix+Edu, Pix+Droit');
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
