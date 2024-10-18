import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import PasswordResetForm from 'mon-pix/components/authentication/password-reset-form/password-reset-form';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const I18N_KEYS = {
  passwordInputLabel: 'components.authentication.password-reset-form.password-input-label',
  mandatoryFieldsMessage: 'common.form.mandatory-all-fields',
  resetPasswordButton: 'components.authentication.password-reset-form.actions.submit',
};

module('Integration | Component | Authentication | PasswordResetForm | PasswordResetForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('displays all elements of component successfully', async function (assert) {
    const screen = await render(<template><PasswordResetForm /></template>);

    assert.dom(screen.getByText(t(I18N_KEYS.mandatoryFieldsMessage))).exists();
    assert.dom(screen.getByLabelText(t(I18N_KEYS.passwordInputLabel))).exists();
    assert.dom(screen.getByRole('button', { name: t(I18N_KEYS.resetPasswordButton) })).exists();
  });
});
