import { setupTest } from 'ember-qunit';
import { SignupFormValidation } from 'mon-pix/components/authentication/signup-form/signup-form-validation.js';
import { module, test } from 'qunit';

const I18N_ERRORS = {
  firstName: 'components.authentication.signup-form.fields.firstname.error',
  lastName: 'components.authentication.signup-form.fields.lastname.error',
  email: 'components.authentication.signup-form.fields.email.error',
  password: 'common.validation.password.error',
  cgu: 'common.cgu.error',
};

module('Unit | Component | authentication | signup-form | validation', function (hooks) {
  setupTest(hooks);
  let signupFormValidation;

  hooks.beforeEach(function () {
    const intlMock = { t: (key) => key };
    signupFormValidation = new SignupFormValidation(intlMock);
  });

  test('it is instanciated with default input validation statuses', function (assert) {
    // then
    assert.strictEqual(signupFormValidation.firstName.status, 'default');
    assert.strictEqual(signupFormValidation.lastName.status, 'default');
    assert.strictEqual(signupFormValidation.email.status, 'default');
    assert.strictEqual(signupFormValidation.password.status, 'default');
    assert.strictEqual(signupFormValidation.cgu.status, 'default');
  });

  module('when fields are valid', () => {
    test('it returns validation statuses', function (assert) {
      // given
      const validFirstName = 'John';
      const validLastName = 'Doe';
      const validEmail = 'john.doe@email.com';
      const validPassword = 'Pix12345';
      const validCgu = true;

      // when
      signupFormValidation.validateField('firstName', validFirstName);
      signupFormValidation.validateField('lastName', validLastName);
      signupFormValidation.validateField('email', validEmail);
      signupFormValidation.validateField('password', validPassword);
      signupFormValidation.validateField('cgu', validCgu);

      // then
      assert.true(signupFormValidation.isValid);

      assert.strictEqual(signupFormValidation.firstName.status, 'success');
      assert.strictEqual(signupFormValidation.firstName.errorMessage, null);

      assert.strictEqual(signupFormValidation.lastName.status, 'success');
      assert.strictEqual(signupFormValidation.lastName.errorMessage, null);

      assert.strictEqual(signupFormValidation.email.status, 'success');
      assert.strictEqual(signupFormValidation.email.errorMessage, null);

      assert.strictEqual(signupFormValidation.password.status, 'success');
      assert.strictEqual(signupFormValidation.password.errorMessage, null);

      assert.strictEqual(signupFormValidation.cgu.status, 'success');
      assert.strictEqual(signupFormValidation.cgu.errorMessage, null);
    });
  });

  module('when fields are invalid', () => {
    test('it returns validation statuses and error messages', function (assert) {
      // given
      const invalidFirstName = '';
      const invalidLastName = '';
      const invalidEmail = 'invalid';
      const invalidPassword = 'invalid';
      const invalidCgu = false;

      // when
      signupFormValidation.validateField('firstName', invalidFirstName);
      signupFormValidation.validateField('lastName', invalidLastName);
      signupFormValidation.validateField('email', invalidEmail);
      signupFormValidation.validateField('password', invalidPassword);
      signupFormValidation.validateField('cgu', invalidCgu);

      // then
      assert.false(signupFormValidation.isValid);

      assert.strictEqual(signupFormValidation.firstName.status, 'error');
      assert.strictEqual(signupFormValidation.firstName.errorMessage, I18N_ERRORS.firstName);

      assert.strictEqual(signupFormValidation.lastName.status, 'error');
      assert.strictEqual(signupFormValidation.lastName.errorMessage, I18N_ERRORS.lastName);

      assert.strictEqual(signupFormValidation.email.status, 'error');
      assert.strictEqual(signupFormValidation.email.errorMessage, I18N_ERRORS.email);

      assert.strictEqual(signupFormValidation.password.status, 'error');
      assert.strictEqual(signupFormValidation.password.errorMessage, I18N_ERRORS.password);

      assert.strictEqual(signupFormValidation.cgu.status, 'error');
      assert.strictEqual(signupFormValidation.cgu.errorMessage, I18N_ERRORS.cgu);
    });
  });

  module('when validation errors are set from server', () => {
    test('it returns validation statuses and error messages', function (assert) {
      // given
      const serverErrors = [
        { attribute: 'first-name', message: 'Invalid firstname!' },
        { attribute: 'last-name', message: 'Invalid lastname!' },
        { attribute: 'email', message: 'Invalid email!' },
        { attribute: 'password', message: 'Invalid password!' },
        { attribute: 'cgu', message: 'Invalid cgu!' },
      ];

      // when
      signupFormValidation.setErrorsFromServer(serverErrors);

      // then
      assert.false(signupFormValidation.isValid);

      assert.strictEqual(signupFormValidation.firstName.status, 'error');
      assert.strictEqual(signupFormValidation.firstName.errorMessage, 'Invalid firstname!');

      assert.strictEqual(signupFormValidation.lastName.status, 'error');
      assert.strictEqual(signupFormValidation.lastName.errorMessage, 'Invalid lastname!');

      assert.strictEqual(signupFormValidation.email.status, 'error');
      assert.strictEqual(signupFormValidation.email.errorMessage, 'Invalid email!');

      assert.strictEqual(signupFormValidation.password.status, 'error');
      assert.strictEqual(signupFormValidation.password.errorMessage, 'Invalid password!');

      assert.strictEqual(signupFormValidation.cgu.status, 'error');
      assert.strictEqual(signupFormValidation.cgu.errorMessage, 'Invalid cgu!');
    });
  });
});
