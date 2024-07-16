import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CapacityAlert from 'pix-orga/components/places/capacity-alert';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Places | CapacityAlert', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should render an alert if occupied seats is greater than total seats', async function (assert) {
    // when
    const screen = await render(<template><CapacityAlert @occupied="2" @total="1" /></template>);

    // then
    assert.ok(screen.getByRole('alert', { value: t('banners.over-capacity.message') }));
  });
  test('it should not show alert if occupied seats is equal to total seats', async function (assert) {
    // when
    const screen = await render(<template><CapacityAlert @occupied="1" @total="1" /></template>);

    // then
    assert.notOk(screen.queryByRole('alert', { value: t('banners.over-capacity.message') }));
  });
  test('it should not show alert if occupied seats is less to total seats', async function (assert) {
    // when
    const screen = await render(<template><CapacityAlert @occupied="0" @total="1" /></template>);

    // then
    assert.notOk(screen.queryByRole('alert', { value: t('banners.over-capacity.message') }));
  });
});
