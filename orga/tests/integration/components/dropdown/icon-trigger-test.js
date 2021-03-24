import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Dropdown | icon-trigger', (hooks) => {

  setupIntlRenderingTest(hooks);

  test('should display actions menu', async function(assert) {
    // when
    await render(hbs`<Dropdown::IconTrigger/>`);

    // then
    assert.dom('[aria-label="Afficher les actions"]').exists();
  });

  test('should display actions on click', async function(assert) {
    // when
    await render(hbs`<Dropdown::IconTrigger/>`);
    await clickByLabel('Afficher les actions');

    // then
    assert.dom('[aria-label="Actions"]').exists();
  });

  test('should hide actions on click again', async function(assert) {
    // when
    await render(hbs`<Dropdown::IconTrigger/>`);
    await clickByLabel('Afficher les actions');
    await clickByLabel('Afficher les actions');

    // then
    assert.dom('[aria-label="Actions"]').doesNotExist();
  });
});
