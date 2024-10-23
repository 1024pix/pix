import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import PasswordResetForm from 'mon-pix/components/authentication/password-reset-form/password-reset-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const I18N_KEYS = {
  passwordInputErrorMessage: 'components.authentication.password-reset-form.fields.password.label',
  passwordInputLabel: 'components.authentication.password-reset-form.fields.password.label',
  mandatoryFieldsMessage: 'common.form.mandatory-all-fields',
  resetPasswordButton: 'components.authentication.password-reset-form.actions.submit',
};

const I18N_ERROR_KEYS = {
  '400': 'common.validation.password.error',
  '403': 'components.authentication.password-reset-form.errors.forbidden',
  '404': 'components.authentication.password-reset-form.errors.expired-demand',
  '500': 'common.api-error-messages.internal-server-error',
  unknownError: 'common.api-error-messages.internal-server-error',
};

module('Integration | Component | Authentication | PasswordResetForm | PasswordResetForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('displays all elements of component successfully', async function (assert) {
    // given
    const user = { save: sinon.stub() };
    const temporaryKey = 'temporaryKey';

    // when
    const screen = await render(
      <template><PasswordResetForm @temporaryKey={{temporaryKey}} @user={{user}} /></template>,
    );

    // then
    assert.dom(screen.getByText(t(I18N_KEYS.mandatoryFieldsMessage))).exists();
    assert.dom(screen.getByLabelText(t(I18N_KEYS.passwordInputLabel))).hasAttribute('required');
    assert.dom(screen.getByRole('button', { name: t(I18N_KEYS.resetPasswordButton) })).exists();
  });

  test('resets password successfully', async function (assert) {
    // given
    const validPassword = 'Pix12345';
    const user = { save: sinon.stub() };
    const temporaryKey = 'temporaryKey';

    // when
    await render(<template><PasswordResetForm @temporaryKey={{temporaryKey}} @user={{user}} /></template>);

    await fillByLabel(t(I18N_KEYS.passwordInputLabel), validPassword);
    await clickByName(t(I18N_KEYS.resetPasswordButton));

    // then
    const userSavePayload = {
      adapterOptions: { updatePassword: true, temporaryKey },
    };
    assert.strictEqual(user.password, null);
    sinon.assert.calledWith(user.save, userSavePayload);
  });

  module('when there is a validationError on the password field', function () {
    test('displays an error message on the password input', async function (assert) {
      // given
      const invalidPassword = 'pix';
      const user = { save: sinon.stub() };
      const temporaryKey = 'temporaryKey';

      // when
      const screen = await render(
        <template><PasswordResetForm @temporaryKey={{temporaryKey}} @user={{user}} /></template>,
      );

      await fillByLabel(t(I18N_KEYS.passwordInputLabel), invalidPassword);
      await clickByName(t(I18N_KEYS.resetPasswordButton));

      // then
      assert.dom(screen.getByText(t(I18N_KEYS.passwordInputErrorMessage))).exists();
      sinon.assert.notCalled(user.save);
    });
  });

  module('When there is an error from server', function () {
    const HTTP_ERROR_SERVER = ['400', '403', '404', '500', 'unknownError'];

    HTTP_ERROR_SERVER.forEach((httpErrorCode) => {
      test(`displays, for the ${httpErrorCode} error code, a specific error message`, async function (assert) {
        // given
        const validPassword = 'Pix12345';
        const user = { save: sinon.stub() };
        const temporaryKey = 'temporaryKey';

        user.save.rejects({ errors: [{ status: httpErrorCode }] });

        // when
        const screen = await render(
          <template><PasswordResetForm @temporaryKey={{temporaryKey}} @user={{user}} /></template>,
        );

        await fillByLabel(t(I18N_KEYS.passwordInputLabel), validPassword);
        await clickByName(t(I18N_KEYS.resetPasswordButton));

        // then
        assert.dom(screen.getByRole('alert')).exists();
        assert.dom(screen.getByText(t(I18N_ERROR_KEYS[httpErrorCode]))).exists();
      });
    });
  });
});
