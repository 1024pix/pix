import { FormValidation } from 'mon-pix/utils/form-validation';
import { module, test } from 'qunit';

module('Unit | Utils | form-validation', function (hooks) {
  let formValidation;

  hooks.beforeEach(async function () {
    formValidation = new FormValidation({
      login: { validate: (value) => Boolean(value), error: 'Bad login' },
      password: { validate: (value) => Boolean(value), error: 'Bad password' },
    });
  });

  module('constructor', function () {
    test('default validation status', function (assert) {
      // then
      assert.deepEqual(formValidation.login.status, 'default');
      assert.deepEqual(formValidation.login.error, null);
      assert.deepEqual(formValidation.password.status, 'default');
      assert.deepEqual(formValidation.password.error, null);
    });
  });

  module('check all fields validation with validateAll', function () {
    test('succeeds validation for valid values', function (assert) {
      // when
      const isFormValid = formValidation.validateAll({ login: 'foo', password: 'bar' });

      // then
      assert.true(isFormValid);
      assert.deepEqual(formValidation.login.status, 'success');
      assert.deepEqual(formValidation.login.error, null);
      assert.deepEqual(formValidation.password.status, 'success');
      assert.deepEqual(formValidation.password.error, null);
    });

    test('fails validation for invalid values', function (assert) {
      // when
      const isFormValid = formValidation.validateAll({ login: '', password: '' });

      // then
      assert.false(isFormValid);
      assert.deepEqual(formValidation.login.status, 'error');
      assert.deepEqual(formValidation.login.error, 'Bad login');
      assert.deepEqual(formValidation.password.status, 'error');
      assert.deepEqual(formValidation.password.error, 'Bad password');
    });
  });

  module('check specific field validation', function () {
    test('succeeds validation for a valid value', function (assert) {
      // when
      const isLoginValid = formValidation.login.validate('foo');

      // then
      assert.true(isLoginValid);
      assert.deepEqual(formValidation.login.status, 'success');
      assert.deepEqual(formValidation.login.error, null);
      assert.deepEqual(formValidation.password.status, 'default');
      assert.deepEqual(formValidation.password.error, null);
    });

    test('fails validation for an invalid value', function (assert) {
      // when
      const isLoginValid = formValidation.login.validate('');

      // then
      assert.false(isLoginValid);
      assert.deepEqual(formValidation.login.status, 'error');
      assert.deepEqual(formValidation.login.error, 'Bad login');
      assert.deepEqual(formValidation.password.status, 'default');
      assert.deepEqual(formValidation.password.error, null);
    });
  });

  module('When API errors', function () {
    test('updates validation from API errors', function (assert) {
      // when
      formValidation.setErrorsFromApi([{ attribute: 'login', message: 'Bad login from API' }]);

      // then
      assert.deepEqual(formValidation.login.status, 'error');
      assert.deepEqual(formValidation.login.error, 'Bad login');
      assert.deepEqual(formValidation.login.apiError, 'Bad login from API');
      assert.deepEqual(formValidation.password.status, 'default');
      assert.deepEqual(formValidation.password.error, null);
    });

    test('resets API errors after a field validation', function (assert) {
      // when
      formValidation.setErrorsFromApi([{ attribute: 'login', message: 'Bad login from API' }]);
      formValidation.login.validate('foo');

      // then
      assert.deepEqual(formValidation.login.status, 'success');
      assert.deepEqual(formValidation.login.error, null);
      assert.deepEqual(formValidation.login.apiError, null);
    });

    test('resets API errors after all fields validation', function (assert) {
      // when
      formValidation.setErrorsFromApi([{ attribute: 'login', message: 'Bad login from API' }]);
      formValidation.validateAll({ login: 'foo', password: 'bar' });

      // then
      assert.deepEqual(formValidation.login.status, 'success');
      assert.deepEqual(formValidation.login.error, null);
      assert.deepEqual(formValidation.login.apiError, null);
    });
  });
});
