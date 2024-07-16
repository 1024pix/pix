import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui | Date', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display formatted date', async function (assert) {
    // when
    this.date = new Date('2020-02-01');
    const screen = await render(hbs`<Ui::Date @date={{this.date}} />`);

    // then
    assert.ok(screen.getByText('01/02/2020'));
  });

  test('it should display a dash if no date is given', async function (assert) {
    // when
    const screen = await render(hbs`<Ui::Date />`);

    // then
    assert.ok(screen.getByText(t('components.date.no-date')));
  });
});
