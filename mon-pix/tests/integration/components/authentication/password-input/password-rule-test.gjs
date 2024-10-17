import { render } from '@1024pix/ember-testing-library';
import PasswordRule from 'mon-pix/components/authentication/new-password-input/password-rule';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | authentication | new-password-input | password-rule', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders a valid rule', async function (assert) {
    // given
    const description = 'rule description';
    const isValid = true;
    const key = 'ruleId';

    // when
    const screen = await render(
      <template><PasswordRule @description={{description}} @key={{key}} @isValid={{isValid}} /></template>,
    );

    // then
    const listItemElement = screen.getByRole('listitem');

    assert.dom(listItemElement).exists();
    assert.dom(listItemElement).hasAttribute('aria-label', `${description}.`);
    assert.dom(listItemElement).hasAttribute('class', 'password-rule');
    assert.dom(screen.getByText(description)).exists();
  });

  test('it renders an invalid rule', async function (assert) {
    // given
    const description = 'rule description';
    const isValid = false;
    const key = 'ruleId';

    // when
    const screen = await render(
      <template><PasswordRule @description={{description}} @key={{key}} @isValid={{isValid}} /></template>,
    );

    // then
    const listItemElement = screen.getByRole('listitem');

    assert.dom(listItemElement).exists();
    assert.dom(listItemElement).hasAttribute('aria-label', `${description}.`);
    assert.dom(listItemElement).hasAttribute('class', 'password-rule password-rule--error');
    assert.dom(screen.getByText(description)).exists();
  });
});
