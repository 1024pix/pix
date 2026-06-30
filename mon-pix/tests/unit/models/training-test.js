import { setupTest } from 'ember-qunit';
import Training from 'mon-pix/models/training';
import { module, test } from 'qunit';

module('Unit | Model | training', function (hooks) {
  setupTest(hooks);

  module('#formatDuration', function () {
    module('when training does not have duration', function () {
      test('it returns an empty string', function (assert) {
        // given
        const duration = null;

        // when
        const displayedDuration = Training.formatDuration({ locale: 'fr-FR', duration });

        // then
        assert.strictEqual(displayedDuration, '');
      });
    });

    module('when training has only days duration', function () {
      test('it returns days only', function (assert) {
        // given
        const duration = {
          days: 3,
        };

        // when
        const displayedDuration = Training.formatDuration({ locale: 'fr-FR', duration });

        // then
        assert.strictEqual(displayedDuration, '3\u00A0jours');
      });
    });
  });

  module('when training has days and hours duration', function () {
    test('it displays complete duration', function (assert) {
      // given
      const duration = { days: 3, hours: 1, minutes: 0 };

      // when
      const displayedDuration = Training.formatDuration({ locale: 'fr-FR', duration });

      // then
      assert.strictEqual(displayedDuration, '3\u00A0jours et 1h');
    });
  });

  module('when training has minutes and hours duration', function () {
    test('it displays complete duration', function (assert) {
      // given
      const duration = { days: 0, hours: 1, minutes: 30 };

      // when
      const displayedDuration = Training.formatDuration({ locale: 'fr-FR', duration });

      // then
      assert.strictEqual(displayedDuration, '1h30min');
    });
  });
});
