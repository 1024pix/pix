import { setupTest } from 'ember-qunit';
import { PasswordResetFormValidation } from 'mon-pix/components/authentication/password-reset-form/password-reset-form-validation';
import { module, test } from 'qunit';

module('Unit | Component | authentication | password-reset-form | password-reset-form-validation', function (hooks) {
  setupTest(hooks);
  let passwordResetFormValidation;

  hooks.beforeEach(function () {
    const intlMock = { t: (key) => key };
    passwordResetFormValidation = new PasswordResetFormValidation(intlMock);
  });

  test('instantiates with default value', function (assert) {
    // then
    assert.strictEqual(passwordResetFormValidation.passwordField.errorMessage, null);
    assert.strictEqual(passwordResetFormValidation.passwordField.status, 'default');
  });

  module('when password field value is valid', () => {
    test("returns 'success' validation", function (assert) {
      // given
      const validPassword = 'Pix12345';

      // when
      passwordResetFormValidation.validateField(validPassword);

      // then
      assert.strictEqual(passwordResetFormValidation.passwordField.status, 'success');
      assert.strictEqual(passwordResetFormValidation.passwordField.errorMessage, null);
      assert.true(passwordResetFormValidation.isValid);
    });
  });

  module('when password field value is not valid', () => {
    test("returns 'error' validation", function (assert) {
      // given
      const validPassword = 'pix';

      // when
      passwordResetFormValidation.validateField(validPassword);

      // then
      assert.strictEqual(passwordResetFormValidation.passwordField.status, 'error');
      assert.strictEqual(passwordResetFormValidation.passwordField.errorMessage, 'common.validation.password.error');
      assert.false(passwordResetFormValidation.isValid);
    });
  });
});
