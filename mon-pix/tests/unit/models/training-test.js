import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Unit | Model | training', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#formattedDuration', function () {
    module('when training has only days duration', function () {
      test('it returns days only', async function (assert) {
        // given
        const training = store.createRecord('training', {
          type: 'modulix',
          duration: {
            days: 3,
          },
        });

        // when
        const displayedDuration = training.formattedDuration;

        // then
        assert.strictEqual(displayedDuration, '3 jours');
      });
    });
  });

  module('when training has days and hours duration', function () {
    test('it displays complete duration', async function (assert) {
      // given
      const training = store.createRecord('training', { type: 'modulix', duration: { days: 3, hours: 1, minutes: 0 } });

      // when
      const displayedDuration = training.formattedDuration;

      // then
      assert.strictEqual(displayedDuration, '3 jours et 1h');
    });
  });

  module('when training has minutes and hours duration', function () {
    test('it displays complete duration', async function (assert) {
      // given
      const training = store.createRecord('training', {
        type: 'modulix',
        duration: { days: 0, hours: 1, minutes: 30 },
      });

      // when
      const displayedDuration = training.formattedDuration;

      // then
      assert.strictEqual(displayedDuration, '1h30min');
    });
  });
});
