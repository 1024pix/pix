import { render, within } from '@1024pix/ember-testing-library';
import List from 'pix-admin/components/certification-frameworks/list';
import { module, test } from 'qunit';

import setupIntlRenderingTest, { t } from '../../../helpers/setup-intl-rendering';

module('Integration | Component | certification-frameworks/list', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display certification frameworks list', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const certificationFrameworks = [
      store.createRecord('certification-framework', {
        id: 'CORE',
        scope: 'CORE',
        versionSummaries: [
          store.createRecord('certification-version-summary', {
            id: 1,
            startDate: new Date('2024-01-01'),
          }),
        ],
      }),
      store.createRecord('certification-framework', {
        id: 'DROIT',
        scope: 'DROIT',
        versionSummaries: [
          store.createRecord('certification-version-summary', {
            id: 2,
            startDate: new Date('2024-01-01'),
            expirationDate: new Date('2024-02-02'),
          }),
        ],
      }),
    ];

    // when
    const screen = await render(<template><List @certificationFrameworks={{certificationFrameworks}} /></template>);

    // then
    const table = screen.getByRole('table', { name: t('components.certification-frameworks.list.caption') });
    assert
      .dom(within(table).getByRole('columnheader', { name: t('components.certification-frameworks.list.name') }))
      .exists();
    assert
      .dom(
        within(table).getByRole('columnheader', {
          name: t('components.certification-frameworks.list.active-version-start-date'),
        }),
      )
      .exists();

    const rows = within(table).getAllByRole('row');
    assert.strictEqual(rows.length, 3);
  });

  test('it should display "-" when activeVersionStartDate is null', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const certificationFrameworks = [
      store.createRecord('certification-framework', {
        id: 'DROIT',
        scope: 'DROIT',
        versionSummaries: [
          store.createRecord('certification-version-summary', {
            id: 2,
            startDate: new Date('2024-01-01'),
            expirationDate: new Date('2024-02-02'),
          }),
        ],
      }),
    ];

    // when
    const screen = await render(<template><List @certificationFrameworks={{certificationFrameworks}} /></template>);

    // then
    assert.dom(screen.getByText('-')).exists();
  });

  test('it should display a link to item route when the framework exists', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const certificationFrameworks = [
      store.createRecord('certification-framework', {
        id: 'DROIT',
        scope: 'DROIT',
      }),
    ];

    // when
    const screen = await render(<template><List @certificationFrameworks={{certificationFrameworks}} /></template>);

    // then
    const link = screen.getByRole('link', { name: t('components.certification-frameworks.labels.DROIT') });
    assert.dom(link).exists();
    assert.dom(link).hasAttribute('href', '/certification-frameworks/DROIT');
  });
});
