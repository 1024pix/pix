import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import SignupForm from 'mon-pix/components/authentication/signup-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubSessionService } from '../../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const I18N_KEYS = {
  firstNameInput: 'components.authentication.signup-form.fields.firstname.label',
  lastNameInput: 'components.authentication.signup-form.fields.lastname.label',
  emailInput: 'components.authentication.signup-form.fields.email.label',
  passwordInput: 'common.password',
  cguCheckbox: 'common.legal-documents.label',
  submitButton: 'components.authentication.signup-form.actions.submit',
};

module('Integration | Component | Authentication | SignupForm | index', function (hooks) {
  setupIntlRenderingTest(hooks);

  let sessionService;
  let urlService;

  hooks.beforeEach(async function () {
    sessionService = stubSessionService(this.owner, { isAuthenticated: false });
    urlService = this.owner.lookup('service:url');
  });

  test('it signs up successfully', async function (assert) {
    //given
    const userModel = { save: sinon.stub() };
    sessionService.authenticateUser.resolves();

    const firstName = 'John';
    const lastName = 'Doe';
    const email = 'john.doe@email.com';
    const password = 'JeMeLoggue1024';

    // when
    await render(<template><SignupForm @user={{userModel}} /></template>);
    await fillByLabel(t(I18N_KEYS.firstNameInput), firstName);
    await fillByLabel(t(I18N_KEYS.lastNameInput), lastName);
    await fillByLabel(t(I18N_KEYS.emailInput), email);
    await fillByLabel(t(I18N_KEYS.passwordInput), password);
    await clickByName(t(I18N_KEYS.cguCheckbox));
    await clickByName(t(I18N_KEYS.submitButton));

    // then
    assert.strictEqual(userModel.firstName, firstName);
    assert.strictEqual(userModel.lastName, lastName);
    assert.strictEqual(userModel.email, email);
    assert.strictEqual(userModel.password, null);
    assert.strictEqual(userModel.lang, 'fr');
    assert.true(userModel.cgu);

    assert.ok(userModel.save.called);
    assert.ok(sessionService.authenticateUser.calledWith(email, password));
  });

  test('it has all inputs required', async function (assert) {
    // given
    const userModel = { save: sinon.stub() };

    // when
    const screen = await render(<template><SignupForm @user={{userModel}} /></template>);

    // then
    assert.dom(screen.getByText(t('common.form.mandatory-all-fields'))).exists();
    assert.dom(screen.getByLabelText(t(I18N_KEYS.firstNameInput))).hasAttribute('aria-required');
    assert.dom(screen.getByLabelText(t(I18N_KEYS.lastNameInput))).hasAttribute('aria-required');
    assert.dom(screen.getByLabelText(t(I18N_KEYS.emailInput))).hasAttribute('aria-required');
    assert.dom(screen.getByLabelText(t(I18N_KEYS.passwordInput))).hasAttribute('aria-required');
    assert.dom(screen.getByLabelText(t(I18N_KEYS.cguCheckbox))).hasAttribute('aria-required');
  });

  module('When there are spaces in form inputs values', function () {
    test('the values are trimmed', async function (assert) {
      //given
      const userModel = { save: sinon.stub() };
      sessionService.authenticateUser.resolves();

      const firstName = ' John ';
      const lastName = ' Doe ';
      const email = ' john.doe@email.com ';
      const password = ' JeMeLoggue1024 ';

      // when
      await render(<template><SignupForm @user={{userModel}} /></template>);
      await fillByLabel(t(I18N_KEYS.firstNameInput), firstName);
      await fillByLabel(t(I18N_KEYS.lastNameInput), lastName);
      await fillByLabel(t(I18N_KEYS.emailInput), email);
      await fillByLabel(t(I18N_KEYS.passwordInput), password);
      await clickByName(t(I18N_KEYS.cguCheckbox));
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      assert.strictEqual(userModel.firstName, 'John');
      assert.strictEqual(userModel.lastName, 'Doe');
      assert.strictEqual(userModel.email, 'john.doe@email.com');

      assert.ok(sessionService.authenticateUser.calledWith('john.doe@email.com', 'JeMeLoggue1024'));
    });
  });

  module('when user submits without filling the form', function () {
    test('it displays an error messages on each input', async function (assert) {
      // given
      const userModel = { save: sinon.stub() };

      // when
      const screen = await render(<template><SignupForm @user={{userModel}} /></template>);
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      assert.dom(screen.getByText(t('components.authentication.signup-form.fields.firstname.error'))).exists();
      assert.dom(screen.getByText(t('components.authentication.signup-form.fields.lastname.error'))).exists();
      assert.dom(screen.getByText(t('components.authentication.signup-form.fields.email.error'))).exists();
      assert.dom(screen.getByText(t('common.validation.password.error'))).exists();
      assert.dom(screen.getByText(t('common.legal-documents.error'))).exists();
      assert.strictEqual(userModel.save.callCount, 0);
      assert.strictEqual(sessionService.authenticateUser.callCount, 0);
    });
  });

  module('When there are validation errors after filling fields', function () {
    test('it displays error messages on each input', async function (assert) {
      // given
      const userModel = { save: sinon.stub() };
      const invalidEmail = 'john';
      const invalidPassword = '123';

      // when
      const screen = await render(<template><SignupForm @user={{userModel}} /></template>);
      await fillByLabel(t(I18N_KEYS.firstNameInput), '  ');
      await fillByLabel(t(I18N_KEYS.lastNameInput), '  ');
      await fillByLabel(t(I18N_KEYS.emailInput), invalidEmail);
      await fillByLabel(t(I18N_KEYS.passwordInput), invalidPassword);
      await clickByName(t(I18N_KEYS.cguCheckbox));
      await clickByName(t(I18N_KEYS.cguCheckbox)); // check twice to trigger validation
      // then
      assert.dom(screen.getByText(t('components.authentication.signup-form.fields.firstname.error'))).exists();
      assert.dom(screen.getByText(t('components.authentication.signup-form.fields.lastname.error'))).exists();
      assert.dom(screen.getByText(t('components.authentication.signup-form.fields.email.error'))).exists();
      assert.dom(screen.getByText(t('common.validation.password.error'))).exists();
      assert.dom(screen.getByText(t('common.legal-documents.error'))).exists();
      assert.strictEqual(userModel.save.callCount, 0);
      assert.strictEqual(sessionService.authenticateUser.callCount, 0);
    });
  });

  module('When there are server errors from user creation', function () {
    test('it displays error for email invalid', async function (assert) {
      // given
      class UserModel {
        errors = [];
        save() {
          this.errors = [{ attribute: 'email', message: 'INVALID_OR_ALREADY_USED_EMAIL' }];
          throw _buildApiReponseError({ status: 422, isAdapterError: true });
        }
      }
      const userModel = new UserModel();

      // when
      const screen = await render(<template><SignupForm @user={{userModel}} /></template>);
      await fillByLabel(t(I18N_KEYS.firstNameInput), 'John');
      await fillByLabel(t(I18N_KEYS.lastNameInput), 'Doe');
      await fillByLabel(t(I18N_KEYS.emailInput), 'john.doe@email.com');
      await fillByLabel(t(I18N_KEYS.passwordInput), 'JeMeLoggue1024');
      await clickByName(t(I18N_KEYS.cguCheckbox));
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      assert.dom(screen.getByText('Adresse e-mail invalide ou déjà utilisée')).exists();
      assert.strictEqual(sessionService.authenticateUser.callCount, 0);
    });
  });

  module('When a http error occurred', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      const userModel = { save: sinon.stub() };
      screen = await render(<template><SignupForm @user={{userModel}} /></template>);
      await fillByLabel(t(I18N_KEYS.firstNameInput), 'John');
      await fillByLabel(t(I18N_KEYS.lastNameInput), 'Doe');
      await fillByLabel(t(I18N_KEYS.emailInput), 'john.doe@email.com');
      await fillByLabel(t(I18N_KEYS.passwordInput), 'JeMeLoggue1024');
      await clickByName(t(I18N_KEYS.cguCheckbox));
    });

    test('it displays error message for 400 HTTP status code', async function (assert) {
      // given
      sessionService.authenticateUser.rejects(_buildApiReponseError({ status: 400 }));

      // when
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      const errorMessage = t('common.api-error-messages.bad-request-error');
      assert.dom(screen.getByText(errorMessage)).exists();
    });

    test('it displays error message for 504 HTTP status code', async function (assert) {
      // given
      sessionService.authenticateUser.rejects(_buildApiReponseError({ status: 504 }));

      // when
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      const errorMessage = t('common.api-error-messages.gateway-timeout-error');
      assert.dom(screen.getByText(errorMessage)).exists();
    });

    test('it displays error message for other HTTP status code', async function (assert) {
      // given
      sinon.stub(urlService, 'supportHomeUrl').value('http://support.example.net');
      sessionService.authenticateUser.rejects(_buildApiReponseError({ status: 500 }));

      // when
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      const errorMessage = 'Impossible de se connecter. Veuillez réessayer dans quelques instants.';
      assert.dom(screen.getByText(errorMessage, { exact: false })).exists();

      const errorMessageLink = screen.getByRole('link', { name: 'contactez-nous via le centre d’aide' });
      assert.dom(errorMessageLink).hasAttribute('href', urlService.supportHomeUrl);
    });
  });
});

// EmberAdapter and EmberSimpleAuth use different error formats, so we manage both cases below
function _buildApiReponseError({ status = '400', errorCode, meta, isAdapterError = false }) {
  if (isAdapterError) {
    return { errors: [{ status, code: errorCode, meta }], isAdapterError };
  } else {
    return { responseJSON: { errors: [{ status, code: errorCode, meta }] } };
  }
}
