import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { on } from '@ember/modifier';
import { blur } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import PasswordInput from 'mon-pix/components/authentication/password-input';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const I18N = {
  PASSWORD_INPUT_LABEL: 'pages.sign-in.fields.password.label',
  RULES_STATUS_MESSAGE: 'components.authentication.password-input.rules.completed-message',
  ERROR_MESSAGE: 'components.authentication.password-input.error-message',
};

module('Integration | Component | authentication | password-input', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it respects all rules', async function (assert) {
    // given
    const validPassword = 'Pix12345';
    const onInput = sinon.spy();

    const screen = await render(<template><PasswordInput {{on "input" onInput}} /></template>);

    // when
    await fillByLabel(t(I18N.PASSWORD_INPUT_LABEL), validPassword);
    const passwordInputElement = screen.getByLabelText(t(I18N.PASSWORD_INPUT_LABEL));
    await blur(passwordInputElement);

    // then
    const onInputEvent = onInput.firstCall.args[0];
    assert.strictEqual(onInputEvent.target.value, validPassword);

    assert.dom(passwordInputElement).doesNotHaveAttribute('aria-invalid');

    const rulesStatusMessage = t(I18N.RULES_STATUS_MESSAGE, { rulesCompleted: 4, rulesCount: 4 });
    assert.dom(screen.getByText(rulesStatusMessage)).exists();
  });

  test('it does not respect any rules', async function (assert) {
    // given
    const invalidPassword = '     ';
    const onInput = sinon.stub();

    const screen = await render(<template><PasswordInput {{on "input" onInput}} /></template>);

    // when
    await fillByLabel(t(I18N.PASSWORD_INPUT_LABEL), invalidPassword);
    const passwordInputElement = screen.getByLabelText(t(I18N.PASSWORD_INPUT_LABEL));
    await blur(passwordInputElement);

    // then
    assert.dom(passwordInputElement).hasAttribute('aria-invalid');
    assert.dom(screen.getByText(t(I18N.ERROR_MESSAGE))).exists();
  });

  test('it must have a minimum length of 8 chars', async function (assert) {
    // given
    const invalidPassword = 'Pix1234';
    const onInput = sinon.stub();

    const screen = await render(<template><PasswordInput {{on "input" onInput}} /></template>);

    // when
    await fillByLabel(t(I18N.PASSWORD_INPUT_LABEL), invalidPassword);
    const passwordInputElement = screen.getByLabelText(t(I18N.PASSWORD_INPUT_LABEL));
    await blur(passwordInputElement);

    // then
    assert.dom(passwordInputElement).hasAttribute('aria-invalid');
  });

  test('it must contains at least one uppercase char', async function (assert) {
    // given
    const invalidPassword = 'pix12345';
    const onInput = sinon.stub();

    const screen = await render(<template><PasswordInput {{on "input" onInput}} /></template>);

    // when
    await fillByLabel(t(I18N.PASSWORD_INPUT_LABEL), invalidPassword);
    const passwordInputElement = screen.getByLabelText(t(I18N.PASSWORD_INPUT_LABEL));
    await blur(passwordInputElement);

    // then
    assert.dom(passwordInputElement).hasAttribute('aria-invalid');
  });

  test('it must contains at least one lowercase char', async function (assert) {
    // given
    const invalidPassword = 'PIX12345';
    const onInput = sinon.stub();

    const screen = await render(<template><PasswordInput {{on "input" onInput}} /></template>);

    // when
    await fillByLabel(t(I18N.PASSWORD_INPUT_LABEL), invalidPassword);
    const passwordInputElement = screen.getByLabelText(t(I18N.PASSWORD_INPUT_LABEL));
    await blur(passwordInputElement);

    // then
    assert.dom(passwordInputElement).hasAttribute('aria-invalid');
  });

  test('it must contains at least one number', async function (assert) {
    // given
    const invalidPassword = 'PIXpixPIX';
    const onInput = sinon.stub();

    const screen = await render(<template><PasswordInput {{on "input" onInput}} /></template>);

    // when
    await fillByLabel(t(I18N.PASSWORD_INPUT_LABEL), invalidPassword);
    const passwordInputElement = screen.getByLabelText(t(I18N.PASSWORD_INPUT_LABEL));
    await blur(passwordInputElement);

    // then
    assert.dom(passwordInputElement).hasAttribute('aria-invalid');
  });
});
