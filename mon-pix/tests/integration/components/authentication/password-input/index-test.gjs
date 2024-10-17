import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { on } from '@ember/modifier';
import { t } from 'ember-intl/test-support';
import NewPasswordInput from 'mon-pix/components/authentication/new-password-input';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const I18N = {
  PASSWORD_INPUT_LABEL: 'components.authentication.new-password-input.label',
  RULES_STATUS_MESSAGE: 'components.authentication.new-password-input.completed-message',
  ERROR_MESSAGE: 'common.validation.password.error',
  RULE_1: 'common.validation.password.rules.min-length',
  RULE_2: 'common.validation.password.rules.contains-uppercase',
};

module('Integration | Component | authentication | new-password-input', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it triggers the input callback on password change', async function (assert) {
    // given
    const password = 'Pix12345';
    const rules = [];
    const onInput = sinon.spy();

    await render(<template><NewPasswordInput {{on "input" onInput}} @rules={{rules}} /></template>);

    // when
    await fillByLabel(t(I18N.PASSWORD_INPUT_LABEL), password);

    // then
    const onInputEvent = onInput.firstCall.args[0];
    assert.strictEqual(onInputEvent.target.value, password);
  });

  test('it triggers the password rules verification', async function (assert) {
    // given
    const passwordPartiallyValid = 'pix';
    const passwordFullyValid = 'pix1234';
    const rules = [
      { i18nKey: I18N.RULE_1, validate: (value) => value.includes('pix') },
      { i18nKey: I18N.RULE_2, validate: (value) => value.includes('1234') },
    ];

    const screen = await render(<template><NewPasswordInput @rules={{rules}} /></template>);

    // when
    await fillByLabel(t(I18N.PASSWORD_INPUT_LABEL), passwordPartiallyValid);

    // then
    const rulesPartiallyValid = t(I18N.RULES_STATUS_MESSAGE, { rulesCompleted: 1, rulesCount: 2 });
    assert.dom(screen.getByText(rulesPartiallyValid)).exists();

    // When
    await fillByLabel(t(I18N.PASSWORD_INPUT_LABEL), passwordFullyValid);

    // then
    const rulesFullyValid = t(I18N.RULES_STATUS_MESSAGE, { rulesCompleted: 2, rulesCount: 2 });
    assert.dom(screen.getByText(rulesFullyValid)).exists();
  });

  test('it displays error message and validation status', async function (assert) {
    // given
    const password = 'Pix1234';
    const onInput = sinon.stub();
    const validationStatus = 'error';
    const errorMessage = t(I18N.ERROR_MESSAGE);
    const rules = [
      { i18nKey: I18N.RULE_1, validate: () => true },
      { i18nKey: I18N.RULE_2, validate: () => true },
    ];

    // when
    const screen = await render(
      <template>
        <NewPasswordInput
          {{on "input" onInput}}
          @rules={{rules}}
          @validationStatus={{validationStatus}}
          @errorMessage={{errorMessage}}
        />
      </template>,
    );
    await fillByLabel(t(I18N.PASSWORD_INPUT_LABEL), password);

    // then
    const passwordInputElement = screen.getByLabelText(t(I18N.PASSWORD_INPUT_LABEL));
    assert.dom(passwordInputElement).hasAttribute('aria-invalid');

    assert.dom(screen.getByText(errorMessage)).exists();
  });
});
