import { clickByName, render } from '@1024pix/ember-testing-library';
import { on } from '@ember/modifier';
import { t } from 'ember-intl/test-support';
import CguCheckbox from 'mon-pix/components/authentication/signup-form/cgu-checkbox';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const I18N_KEYS = {
  label: 'common.cgu.label',
};

module('Integration | Component | Authentication | SignupForm | CguCheckbox', function (hooks) {
  setupIntlRenderingTest(hooks);

  let urlService;

  hooks.beforeEach(async function () {
    urlService = this.owner.lookup('service:url');
    sinon.stub(urlService, 'cguUrl').value('https://cgu.url');
    sinon.stub(urlService, 'dataProtectionPolicyUrl').value('https://data-protection-policy.url');
  });

  test('it displays the CGU checkbox with links', async function (assert) {
    // when
    const screen = await render(<template><CguCheckbox /></template>);

    // then
    const cguCheckboxElement = screen.getByLabelText(t(I18N_KEYS.label));
    assert.dom(cguCheckboxElement).isNotChecked();

    const cguUrlElement = screen.getByRole('link', { name: "conditions d'utilisation" });
    assert.dom(cguUrlElement).hasAttribute('href', 'https://cgu.url');

    const dataProtectionPolicyElement = screen.getByRole('link', { name: 'politique de confidentialité' });
    assert.dom(dataProtectionPolicyElement).hasAttribute('href', 'https://data-protection-policy.url');
  });

  test('it accepts the CGU and triggers on change event', async function (assert) {
    // given
    const onChange = sinon.stub();

    // when
    const screen = await render(<template><CguCheckbox {{on "change" onChange}} /></template>);
    await clickByName(t(I18N_KEYS.label));

    // then
    const cguCheckboxElement = screen.getByLabelText(t(I18N_KEYS.label));
    assert.dom(cguCheckboxElement).isChecked();

    assert.true(onChange.calledOnce);
  });

  test('it displays an error message', async function (assert) {
    // given
    const errorMessage = 'Error !';

    // when
    const screen = await render(
      <template><CguCheckbox @validationStatus="error" @errorMessage={{errorMessage}} /></template>,
    );

    // then
    const errorMessageElement = screen.getByText('Error !');
    assert.dom(errorMessageElement).exists();
  });
});
