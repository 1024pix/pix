import { module, test } from 'qunit';
import pick from 'lodash/pick';
import { setupTest } from 'ember-qunit';
import setupIntlForModels from '../../helpers/setup-intl';

module('Unit | Model | certification-candidate', function (hooks) {
  setupTest(hooks);
  setupIntlForModels(hooks);

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

  module('#get genderLabel', () => {
    test('should display the correct label for man', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = {
        sex: 'M',
      };

      // when
      const { genderLabel } = store.createRecord('certification-candidate', data);

      // then
      assert.strictEqual(genderLabel, 'Homme');
    });

    test('should display the correct label for woman', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = {
        sex: 'F',
      };

      // when
      const { genderLabel } = store.createRecord('certification-candidate', data);

      // then
      assert.strictEqual(genderLabel, 'Femme');
    });

    test('should not display any label if there is no gender', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = {};

      // when
      const { genderLabel } = store.createRecord('certification-candidate', data);

      // then
      assert.strictEqual(genderLabel, '-');
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
            key: 'A',
            label: 'Pix+Edu',
          },
          {
            id: 2,
            key: 'B',
            label: 'Pix+Droit',
          },
        ],
      };
      // when
      const model = store.createRecord('certification-candidate', data);

      // then
      assert.strictEqual(model.complementaryCertificationsList, 'Pix+Edu, Pix+Droit');
    });
  });

  module('#get billingModeLabel', () => {
    test('should display the billing mode label', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = {
        billingMode: 'PREPAID',
      };
      // when
      const { billingModeLabel } = store.createRecord('certification-candidate', data);

      // then
      assert.strictEqual(billingModeLabel, 'Prépayée');
    });

    test('should not display any label if there is no billing mode', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = {
        billingMode: null,
      };
      // when
      const { billingModeLabel } = store.createRecord('certification-candidate', data);

      // then
      assert.strictEqual(billingModeLabel, '-');
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
