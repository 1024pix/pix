import { clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Dropdown | icon-trigger', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display actions menu', async function (assert) {
    // when
    const screen = await render(hbs`<Dropdown::IconTrigger @ariaLabel='Afficher les actions' />`);

    // then
    assert.dom(screen.getByRole('button', { name: 'Afficher les actions' })).exists();
  });

  test('should display actions on click', async function (assert) {
    // when
    const screen = await render(
      hbs`<Dropdown::IconTrigger @ariaLabel='Afficher les actions'>Something</Dropdown::IconTrigger>`,
    );
    await clickByName('Afficher les actions');

    // then
    assert.dom(screen.getByText('Something')).exists();
  });

  test('should hide actions on click again', async function (assert) {
    // when
    const screen = await render(
      hbs`<Dropdown::IconTrigger @ariaLabel='Afficher les actions'>Something</Dropdown::IconTrigger>`,
    );
    await clickByName('Afficher les actions');
    await clickByName('Afficher les actions');

    // then
    assert.dom(screen.queryByText('Something')).doesNotExist();
  });
});
