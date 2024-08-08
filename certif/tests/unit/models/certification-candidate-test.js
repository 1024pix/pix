import { setupTest } from 'ember-qunit';
import pick from 'lodash/pick';
import { module, test } from 'qunit';

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

  module('hasDualCertificationSubscriptionCoreClea', function () {
    test('it should return true when candidate has subscribed to both clea and core', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const habilitations = [
        {
          id: 123,
          label: 'Certif cléa',
          key: 'CLEA',
        },
      ];
      const coreSubscription = store.createRecord('subscription', {
        type: 'CORE',
        complementaryCertificationId: null,
      });
      const cleaSubscription = store.createRecord('subscription', {
        type: 'COMPLEMENTARY',
        complementaryCertificationId: 123,
      });
      const candidate = store.createRecord('certification-candidate', {
        subscriptions: [coreSubscription, cleaSubscription],
      });

      // when
      const hasDual = candidate.hasDualCertificationSubscriptionCoreClea(habilitations);

      // then
      assert.true(hasDual);
    });

    test('it should return false when candidate has subscribed to core but not clea', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const habilitations = [
        {
          id: 123,
          label: 'Certif cléa',
          key: 'CLEA',
        },
      ];
      const coreSubscription = store.createRecord('subscription', {
        type: 'CORE',
        complementaryCertificationId: null,
      });
      const otherSubscription = store.createRecord('subscription', {
        type: 'COMPLEMENTARY',
        complementaryCertificationId: 124,
      });
      const candidate = store.createRecord('certification-candidate', {
        subscriptions: [coreSubscription, otherSubscription],
      });

      // when
      const hasDual = candidate.hasDualCertificationSubscriptionCoreClea(habilitations);

      // then
      assert.false(hasDual);
    });

    test('it should return false when candidate has subscribed to clea but not core', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const habilitations = [
        {
          id: 123,
          label: 'Certif cléa',
          key: 'CLEA',
        },
      ];
      const cleaSubscription = store.createRecord('subscription', {
        type: 'COMPLEMENTARY',
        complementaryCertificationId: 123,
      });
      const candidate = store.createRecord('certification-candidate', {
        subscriptions: [cleaSubscription],
      });

      // when
      const hasDual = candidate.hasDualCertificationSubscriptionCoreClea(habilitations);

      // then
      assert.false(hasDual);
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
