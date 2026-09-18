import { t } from 'ember-intl/test-support';
import { setupTest } from 'ember-qunit';
import setupIntl from 'pix-admin/tests/helpers/setup-intl';
import { getTranslatedMessageFromValidationCode } from 'pix-admin/utils/get-message-from-validation-code';
import { module, test } from 'qunit';

module('Unit | Utils | get-message-from-validation-code', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'fr');

  module('when code is "FIELD_REQUIRED"', function (hooks) {
    let intl;

    hooks.beforeEach(function () {
      intl = this.owner.lookup('service:intl');
    });

    test('it returns correct translated message', function (assert) {
      // given
      const code = 'FIELD_REQUIRED';

      // when
      const result = getTranslatedMessageFromValidationCode(intl, code);

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
      const result = getTranslatedMessageFromValidationCode(intl, code);

      // then
      assert.strictEqual(result, t('common.validation-error-messages.FIELD_NOT_A_NUMBER'));
    });
  });

  module('when code is any other value', function (hooks) {
    let intl;

    hooks.beforeEach(function () {
      intl = this.owner.lookup('service:intl');
    });

    test('it returns default translated message', function (assert) {
      // given
      const code = 'other_code';

      // when
      const result = getTranslatedMessageFromValidationCode(intl, code);

      // then
      assert.strictEqual(result, t('common.validation-error-messages.DEFAULT'));
    });
  });
});
