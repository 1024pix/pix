import { render, within } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Statistics from 'pix-admin/components/organizations/statistics';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Organizations | Statistics', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  test('displays total participants count', async function (assert) {
    // given
    const statistics = store.createRecord('organization-statistic', {
      totalParticipantsCount: 1234,
    });

    // when
    const screen = await render(<template><Statistics @statistics={{statistics}} /></template>);

    // then
    assert.strictEqual(
      screen.getByRole('term').textContent.trim(),
      t('components.organizations.statistics.total-participants-count.title'),
    );
    assert.strictEqual(screen.getByRole('definition').textContent.trim(), '1234');
    assert.ok(
      screen.getByText(t('components.organizations.statistics.total-participants-count.info'), { hidden: true }),
    );
  });

  test('displays total participants count by year in table', async function (assert) {
    // given
    const statistics = store.createRecord('organization-statistic', {
      totalParticipantsCountByYear: [{ year: 2023, count: 1234 }],
    });

    // when
    const screen = await render(<template><Statistics @statistics={{statistics}} /></template>);

    // then
    const table = screen.getByRole('table', {
      name: t('components.organizations.statistics.total-participants-count-by-year.caption'),
    });

    assert.ok(
      within(table).getByRole('columnheader', {
        name: t('components.organizations.statistics.total-participants-count-by-year.headers.count'),
      }),
    );
    assert.ok(
      within(table).getByRole('columnheader', {
        name: t('components.organizations.statistics.total-participants-count-by-year.headers.year'),
      }),
    );
    assert
      .dom(within(table).getByRole('tooltip', { hidden: true }))
      .hasText(t('components.organizations.statistics.total-participants-count-by-year.headers.count-tooltip'));
    assert.ok(within(table).getByRole('cell', { name: '2023' }));
    assert.ok(within(table).getByRole('cell', { name: '1234' }));
  });
});
