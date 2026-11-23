import { render } from '@1024pix/ember-testing-library';
import IsCertifiable from 'pix-orga/components/ui/is-certifiable';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui | IsCertifiable', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display participant as eligible for certification', async function (assert) {
    // when
    const screen = await render(<template><IsCertifiable @isCertifiable={{true}} /></template>);

    // then
    assert.ok(screen.getByText(t('pages.sco-organization-participants.table.column.is-certifiable.eligible')));
  });

  test('it should display participant as non eligible for certification', async function (assert) {
    // when
    const screen = await render(<template><IsCertifiable @isCertifiable={{false}} /></template>);

    // then
    assert.ok(screen.getByText(t('pages.sco-organization-participants.table.column.is-certifiable.non-eligible')));
  });

  test('it should display participant with not available information about eligibility for certification', async function (assert) {
    // when
    const screen = await render(<template><IsCertifiable @isCertifiable={{null}} /></template>);

    // then
    assert.ok(screen.getByText(t('pages.sco-organization-participants.table.column.is-certifiable.not-available')));
  });
});
