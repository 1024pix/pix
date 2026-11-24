import { render } from '@1024pix/ember-testing-library';
import ParticipationEvolutionIcon from 'pix-orga/components/campaign/results/participation-evolution-icon';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Results::ParticipationEvolutionIcon', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When participant evolution is increase', function () {
    test('should display trendingUp icon', async function (assert) {
      // given
      const evolution = 'increase';

      // when
      const screen = await render(<template><ParticipationEvolutionIcon @evolution={{evolution}} /></template>);

      // then
      assert.ok(screen.getByRole('presentation', { name: t('pages.campaign-results.table.evolution.increase') }));
    });
  });

  module('When participant evolution is decrease', function () {
    test('should display trendingDown icon', async function (assert) {
      // given
      const evolution = 'decrease';

      // when
      const screen = await render(<template><ParticipationEvolutionIcon @evolution={{evolution}} /></template>);

      // then
      assert.ok(screen.getByRole('presentation', { name: t('pages.campaign-results.table.evolution.decrease') }));
    });
  });

  module('When participant evolution is stable', function () {
    test('should display stable icon', async function (assert) {
      // given
      const evolution = 'stable';

      // when
      const screen = await render(<template><ParticipationEvolutionIcon @evolution={{evolution}} /></template>);

      // then
      assert.ok(screen.getByRole('presentation', { name: t('pages.campaign-results.table.evolution.stable') }));
    });
  });

  module('When participant evolution is null', function () {
    test('should display unavaible text', async function (assert) {
      // given
      const evolution = null;

      // when
      const screen = await render(<template><ParticipationEvolutionIcon @evolution={{evolution}} /></template>);

      // then
      assert.ok(screen.getByText(t('pages.campaign-results.table.evolution.unavailable')));
    });
  });
});
