import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import History from 'pix-admin/components/certification-frameworks/certification-framework/target-profile/history';
import { module, test } from 'qunit';

import setupIntlRenderingTest, { t } from '../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Component | certification-frameworks/certification-framework/target-profile/history',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    test("it should display history for framework's target profiles", async function (assert) {
      // given
      const targetProfilesHistory = [
        { id: '1023', name: 'Target Cascade', attachedAt: new Date('2023-10-10T10:50:00Z'), detachedAt: null },
        {
          id: '1025',
          name: 'Target Volcan',
          attachedAt: new Date('2019-10-08T10:50:00Z'),
          detachedAt: new Date('2020-10-08T10:50:00Z'),
        },
      ];

      // when
      const screen = await render(<template><History @targetProfilesHistory={{targetProfilesHistory}} /></template>);
      await click(
        screen.getByRole('button', {
          name: t('components.certification-frameworks.target-profiles.history-list.title'),
        }),
      );

      // then
      const table = screen.getByRole('table', {
        name: t('components.certification-frameworks.target-profiles.history-list.caption'),
      });
      assert
        .dom(
          within(table).getByRole('columnheader', {
            name: t('components.certification-frameworks.target-profiles.history-list.headers.name'),
          }),
        )
        .exists();
      assert
        .dom(
          within(table).getByRole('columnheader', {
            name: t('components.certification-frameworks.target-profiles.history-list.headers.attached-at'),
          }),
        )
        .exists();
      assert
        .dom(
          within(table).getByRole('columnheader', {
            name: t('components.certification-frameworks.target-profiles.history-list.headers.detached-at'),
          }),
        )
        .exists();
      assert.dom(within(table).getByRole('cell', { name: 'Target Cascade' })).exists();
      assert.dom(within(table).getByRole('cell', { name: 'Target Volcan' })).exists();
      assert.strictEqual(
        within(table).getAllByRole('button', {
          name: t('components.certification-frameworks.target-profiles.history-list.actions.view'),
        }).length,
        2,
      );
    });
  },
);
