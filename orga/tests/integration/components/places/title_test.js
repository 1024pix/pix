import { render } from '@1024pix/ember-testing-library';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Places::Title', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display date of today', async function (assert) {
    // given
    const today = dayjs();

    // when
    const screen = await render(hbs`<Places::Title />`);

    // then
    assert.ok(screen.getByText(t('pages.places.title')));
    assert.ok(screen.getByText(t('pages.places.before-date'), { exact: false }));
    assert.ok(screen.getByText(today.format('DD/MM/YYYY'), { exact: false }));
  });
});
