import { render } from '@1024pix/ember-testing-library';
import UiDate from 'pix-orga/components/ui/date';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui | Date', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display formatted date', async function (assert) {
    // when
    const date = new Date('2020-02-01');
    const screen = await render(<template><UiDate @date={{date}} /></template>);

    // then
    assert.ok(screen.getByText('01/02/2020'));
  });

  test('it should display a dash if no date is given', async function (assert) {
    // when
    const screen = await render(<template><UiDate /></template>);

    // then
    assert.ok(screen.getByText(t('components.date.no-date')));
  });
});
