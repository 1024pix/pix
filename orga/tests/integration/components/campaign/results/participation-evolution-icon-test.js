import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Results::ParticipationEvolutionIcon', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When participant evolution is increase', function () {
    test('should display trendingUp icon', async function (assert) {
      // given
      const evolution = 'increase';
      this.set('evolution', evolution);

      // when
      const screen = await render(hbs`<Campaign::Results::ParticipationEvolutionIcon @evolution={{this.evolution}} />`);

      // then
      assert.ok(screen.getByRole('img', { name: t('pages.campaign-results.table.evolution.increase') }));
    });
  });

  module('When participant evolution is decrease', function () {
    test('should display trendingDown icon', async function (assert) {
      // given
      const evolution = 'decrease';
      this.set('evolution', evolution);

      // when
      const screen = await render(hbs`<Campaign::Results::ParticipationEvolutionIcon @evolution={{this.evolution}} />`);

      // then
      assert.ok(screen.getByRole('img', { name: t('pages.campaign-results.table.evolution.decrease') }));
    });
  });

  module('When participant evolution is stable', function () {
    test('should display stable icon', async function (assert) {
      // given
      const evolution = 'stable';
      this.set('evolution', evolution);

      // when
      const screen = await render(hbs`<Campaign::Results::ParticipationEvolutionIcon @evolution={{this.evolution}} />`);

      // then
      assert.ok(screen.getByRole('img', { name: t('pages.campaign-results.table.evolution.stable') }));
    });
  });

  module('When participant evolution is null', function () {
    test('should display unavaible text', async function (assert) {
      // given
      const evolution = null;
      this.set('evolution', evolution);

      // when
      const screen = await render(hbs`<Campaign::Results::ParticipationEvolutionIcon @evolution={{this.evolution}} />`);

      // then
      assert.ok(screen.getByText(t('pages.campaign-results.table.evolution.unavailable')));
    });
  });
});
