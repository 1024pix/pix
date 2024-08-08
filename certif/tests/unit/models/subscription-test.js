import { setupTest } from 'ember-qunit';
import { COMPLEMENTARY_KEYS, SUBSCRIPTION_TYPES } from 'pix-certif/models/subscription';
import { module, test } from 'qunit';

import setupIntlForModels from '../../helpers/setup-intl';

module('Unit | Model | subscription', function (hooks) {
  setupTest(hooks);
  setupIntlForModels(hooks);

  module('isClea', function () {
    test('it should return true when subscription is CLEA', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const habilitations = [
        {
          id: 123,
          label: 'Certif cléa',
          key: COMPLEMENTARY_KEYS.CLEA,
        },
      ];
      const cleaSubscription = store.createRecord('subscription', {
        type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
        complementaryCertificationId: 123,
      });

      // when
      const isClea = cleaSubscription.isClea(habilitations);

      // then
      assert.true(isClea);
    });

    test('it should return false when subscription is complementary but not CLEA', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const cleaId = 123;
      const notCleaId = 124;
      const habilitations = [
        {
          id: cleaId,
          label: 'Certif cléa',
          key: COMPLEMENTARY_KEYS.CLEA,
        },
      ];
      const otherSubscription = store.createRecord('subscription', {
        type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
        complementaryCertificationId: notCleaId,
      });

      // when
      const isClea = otherSubscription.isClea(habilitations);

      // then
      assert.false(isClea);
    });

    test('it should return false when subscription is CORE', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const habilitations = [
        {
          id: 123,
          label: 'Certif cléa',
          key: COMPLEMENTARY_KEYS.CLEA,
        },
      ];
      const coreSubscription = store.createRecord('subscription', {
        type: SUBSCRIPTION_TYPES.CORE,
        complementaryCertificationId: null,
      });

      // when
      const isClea = coreSubscription.isClea(habilitations);

      // then
      assert.false(isClea);
    });
  });

  module('get isCore', function () {
    test('it should return true when subscription is CORE', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const coreSubscription = store.createRecord('subscription', {
        type: SUBSCRIPTION_TYPES.CORE,
        complementaryCertificationId: null,
      });

      // when
      const isCore = coreSubscription.isCore;

      // then
      assert.true(isCore);
    });

    test('it should return false when subscription is not core', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const otherSubscription = store.createRecord('subscription', {
        type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
        complementaryCertificationId: 123,
      });

      // when
      const isCore = otherSubscription.isCore;

      // then
      assert.false(isCore);
    });
  });
});
