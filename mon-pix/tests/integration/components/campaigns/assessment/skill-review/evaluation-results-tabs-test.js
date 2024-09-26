import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Campaigns | Assessment | Skill Review | Evaluation Results Tabs', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there are rewards and trainings', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      // given
      const store = this.owner.lookup('service:store');

      const acquiredBadge = store.createRecord('badge', { isAcquired: true });
      this.set('badges', [acquiredBadge]);

      const training = store.createRecord('training', { duration: { days: 2 } });
      this.set('trainings', [training]);

      // when
      screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs @badges={{this.badges}} @trainings={{this.trainings}} />`,
      );
    });

    test('it should display a tablist with three tabs', async function (assert) {
      // then
      assert.dom(screen.getByRole('tablist', { name: t('pages.skill-review.tabs.aria-label') })).exists();
      assert.strictEqual(screen.getAllByRole('tab').length, 3);
      assert.dom(screen.getByRole('tab', { name: t('pages.skill-review.tabs.rewards.tab-label') }));
      assert.dom(screen.getByRole('tab', { name: t('pages.skill-review.tabs.results-details.tab-label') }));
      assert.dom(screen.getByRole('tab', { name: t('pages.skill-review.tabs.trainings.tab-label') }));
    });

    test('it should display the rewards tab first', async function (assert) {
      // then
      assert.dom(screen.getByRole('heading', { name: t('pages.skill-review.tabs.rewards.title') })).isVisible();
    });
  });

  module('when there are rewards but no trainings', function () {
    test('it should not display the trainings tab', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const acquiredBadge = store.createRecord('badge', { isAcquired: true });
      this.set('badges', [acquiredBadge]);
      this.set('trainings', []);
      this.set('competenceResults', []);

      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs
  @badges={{this.badges}}
  @trainings={{this.trainings}}
  @competenceResults={{this.competenceResults}}
/>`,
      );

      // then
      assert.dom(screen.getByRole('tablist', { name: t('pages.skill-review.tabs.aria-label') })).exists();
      assert.strictEqual(screen.getAllByRole('tab').length, 2);
      assert.dom(screen.getByRole('tab', { name: t('pages.skill-review.tabs.rewards.tab-label') }));
      assert.dom(screen.getByRole('tab', { name: t('pages.skill-review.tabs.results-details.tab-label') }));
      assert.notOk(screen.queryByRole('tab', { name: t('pages.skill-review.tabs.trainings.tab-label') }));
    });
  });

  module('when there are no rewards but trainings', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      // given
      const store = this.owner.lookup('service:store');

      this.set('badges', []);
      this.set('competenceResults', []);

      const training = store.createRecord('training', { duration: { days: 2 } });
      this.set('trainings', [training]);

      // when
      screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs
  @badges={{this.badges}}
  @trainings={{this.trainings}}
  @competenceResults={{this.competenceResults}}
/>`,
      );
    });

    test('it should not display the rewards tab', async function (assert) {
      // then
      assert.dom(screen.getByRole('tablist', { name: t('pages.skill-review.tabs.aria-label') })).exists();
      assert.strictEqual(screen.getAllByRole('tab').length, 2);
      assert.notOk(screen.queryByRole('tab', { name: t('pages.skill-review.tabs.rewards.tab-label') }));
      assert.dom(screen.getByRole('tab', { name: t('pages.skill-review.tabs.results-details.tab-label') }));
      assert.dom(screen.getByRole('tab', { name: t('pages.skill-review.tabs.trainings.tab-label') }));
    });

    test('it should display the results details tab first', async function (assert) {
      // then
      assert.dom(screen.getByRole('heading', { name: t('pages.skill-review.tabs.results-details.title') })).isVisible();
    });
  });

  module('when there are no rewards and no trainings', function () {
    test('it should not display the tabs component', async function (assert) {
      // given
      this.set('badges', []);
      this.set('trainings', []);
      this.set('competenceResults', []);

      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs
  @badges={{this.badges}}
  @trainings={{this.trainings}}
  @competenceResults={{this.competenceResults}}
/>`,
      );

      // then
      assert.notOk(screen.queryByRole('tablist', { name: t('pages.skill-review.tabs.aria-label') }));
    });
  });
});
