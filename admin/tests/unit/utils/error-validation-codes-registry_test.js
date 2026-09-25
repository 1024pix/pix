import { t } from 'ember-intl/test-support';
import { setupTest } from 'ember-qunit';
import setupIntl from 'pix-admin/tests/helpers/setup-intl';
import { errorValidationCodesRegistry } from 'pix-admin/utils/error-validation-codes-registry';
import { module, test } from 'qunit';

module('Unit | Utils | error-validation-codes-registry', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'fr');

  module('#getTranslatedMessageFromValidationCode', function () {
    module('when code is "FIELD_REQUIRED"', function (hooks) {
      let intl;

      hooks.beforeEach(function () {
        intl = this.owner.lookup('service:intl');
      });

      test('it returns correct translated message', function (assert) {
        // given
        const code = 'FIELD_REQUIRED';

        // when
        const result = errorValidationCodesRegistry.getTranslatedMessageFromValidationCode(intl, code);

        // then
        assert.strictEqual(result, t('common.validation-error-messages.FIELD_REQUIRED'));
      });
    });

    module('when code is "FIELD_NOT_A_NUMBER"', function (hooks) {
      let intl;

      hooks.beforeEach(function () {
        intl = this.owner.lookup('service:intl');
      });

      test('it returns correct translated message', function (assert) {
        // given
        const code = 'FIELD_NOT_A_NUMBER';

        // when
        const result = errorValidationCodesRegistry.getTranslatedMessageFromValidationCode(intl, code);

        // then
        assert.strictEqual(result, t('common.validation-error-messages.FIELD_NOT_A_NUMBER'));
      });
    });

    module('when code is any other value', function (hooks) {
      let intl;

      hooks.beforeEach(function () {
        intl = this.owner.lookup('service:intl');
      });

      test('it returns validation code', function (assert) {
        // given
        const code = 'other_code';

        // when
        const result = errorValidationCodesRegistry.getTranslatedMessageFromValidationCode(intl, code);

        // then
        assert.strictEqual(result, code);
      });
    });
  });
});
