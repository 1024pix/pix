import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Campaigns | Assessment | Skill Review | Evaluation Results Tabs', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there are rewards and trainings', function (hooks) {
    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');
      const acquiredBadge = store.createRecord('badge', { isAcquired: true });
      this.set('badges', [acquiredBadge]);
    });

    test('it should display a tablist with three tabs', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs @badges={{this.badges}} />`,
      );

      // then
      assert.dom(screen.getByRole('tablist', { name: this.intl.t('pages.skill-review.tabs.aria-label') })).exists();
      assert.strictEqual(screen.getAllByRole('tab').length, 3);
      assert.dom(screen.getByRole('tab', { name: this.intl.t('pages.skill-review.tabs.rewards.tab-label') }));
      assert.dom(screen.getByRole('tab', { name: this.intl.t('pages.skill-review.tabs.results-details.tab-label') }));
      assert.dom(screen.getByRole('tab', { name: this.intl.t('pages.skill-review.tabs.trainings.tab-label') }));
    });

    test('it should display the rewards tab first', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs @badges={{this.badges}} />`,
      );

      // then
      assert
        .dom(screen.getByRole('heading', { name: this.intl.t('pages.skill-review.tabs.rewards.title') }))
        .isVisible();
    });
  });

  module('when there are no rewards', function () {
    test('it should not display the rewards tab', async function (assert) {
      // given
      this.set('badges', []);

      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs @badges={{this.badges}} />`,
      );

      // then
      assert.dom(screen.getByRole('tablist', { name: this.intl.t('pages.skill-review.tabs.aria-label') })).exists();
      assert.strictEqual(screen.getAllByRole('tab').length, 2);
      assert.notOk(screen.queryByRole('tab', { name: this.intl.t('pages.skill-review.tabs.rewards.tab-label') }));
      assert.dom(screen.getByRole('tab', { name: this.intl.t('pages.skill-review.tabs.results-details.tab-label') }));
      assert.dom(screen.getByRole('tab', { name: this.intl.t('pages.skill-review.tabs.trainings.tab-label') }));
    });

    test('it should display the results details tab first', async function (assert) {
      // given
      this.set('badges', []);

      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs @badges={{this.badges}} />`,
      );

      // then
      assert
        .dom(screen.getByRole('heading', { name: this.intl.t('pages.skill-review.tabs.results-details.title') }))
        .isVisible();
    });
  });
});
