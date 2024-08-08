import { setupTest } from 'ember-qunit';
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
          key: 'CLEA',
        },
      ];
      const cleaSubscription = store.createRecord('subscription', {
        type: 'COMPLEMENTARY',
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
      const habilitations = [
        {
          id: 123,
          label: 'Certif cléa',
          key: 'CLEA',
        },
      ];
      const otherSubscription = store.createRecord('subscription', {
        type: 'COMPLEMENTARY',
        complementaryCertificationId: 124,
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
          key: 'CLEA',
        },
      ];
      const coreSubscription = store.createRecord('subscription', {
        type: 'CORE',
        complementaryCertificationId: null,
      });

      // when
      const isClea = coreSubscription.isClea(habilitations);

      // then
      assert.false(isClea);
    });
  });
});
