import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import EvaluationResultsTabs from 'mon-pix/components/campaigns/assessment/results/evaluation-results-tabs';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Campaigns | Assessment | Results | Evaluation Results Tabs', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there are rewards and trainings', function (hooks) {
    let screen;
    let onResultsSharedStub;

    hooks.beforeEach(async function () {
      // given
      const store = this.owner.lookup('service:store');

      const acquiredBadge = store.createRecord('badge', { isAcquired: true });
      const campaignParticipationResult = {
        campaignParticipationBadges: [acquiredBadge],
        isShared: false,
      };

      const training = store.createRecord('training', { duration: { days: 2 } });
      const trainings = [training];

      onResultsSharedStub = sinon.stub();
      const onResultsShared = onResultsSharedStub;

      // when
      screen = await render(
        <template>
          <EvaluationResultsTabs
            @campaignParticipationResult={{campaignParticipationResult}}
            @trainings={{trainings}}
            @onResultsShared={{onResultsShared}}
            @isCampaignNotAutonomousCourseOrAbsoluteNovice={{true}}
          />
        </template>,
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

      const campaignParticipationResult = {
        campaignParticipationBadges: [acquiredBadge],
        competenceResults: [],
      };

      const trainings = [];

      // when
      const screen = await render(
        <template>
          <EvaluationResultsTabs
            @campaignParticipationResult={{campaignParticipationResult}}
            @trainings={{trainings}}
          />
        </template>,
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

      const campaignParticipationResult = {
        campaignParticipationBadges: [],
        competenceResults: [],
      };

      const training = store.createRecord('training', { duration: { days: 2 } });
      const trainings = [training];

      // when
      screen = await render(
        <template>
          <EvaluationResultsTabs
            @campaignParticipationResult={{campaignParticipationResult}}
            @trainings={{trainings}}
          />
        </template>,
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
      const trainings = [];

      const campaignParticipationResult = {
        campaignParticipationBadges: [],
        competenceResults: [],
      };

      // when
      const screen = await render(
        <template>
          <EvaluationResultsTabs
            @campaignParticipationResult={{campaignParticipationResult}}
            @trainings={{trainings}}
          />
        </template>,
      );

      // then
      assert.notOk(screen.queryByRole('tablist', { name: t('pages.skill-review.tabs.aria-label') }));
    });
  });
  module('when in a combined course context', function (hooks) {
    let onResultsSharedStub;

    hooks.beforeEach(async function () {
      // given
      const store = this.owner.lookup('service:store');
      const campaignParticipationResult = {
        campaignParticipationBadges: [],
        isShared: false,
        competenceResults: [],
      };

      const training = store.createRecord('training', { duration: { days: 2 } });
      const trainings = [training];

      onResultsSharedStub = sinon.stub();
      const onResultsShared = onResultsSharedStub;

      // when
      await render(
        <template>
          <EvaluationResultsTabs
            @campaignParticipationResult={{campaignParticipationResult}}
            @trainings={{trainings}}
            @onResultsShared={{onResultsShared}}
            @isCampaignNotAutonomousCourseOrAbsoluteNovice={{true}}
          />
        </template>,
      );
    });
    test('it should not display trainings', async function (assert) {
      // given
      const campaignParticipationResult = {
        campaignParticipationBadges: [],
        isShared: false,
        competenceResults: [],
      };
      const trainings = [];

      // when
      const screen = await render(
        <template>
          <EvaluationResultsTabs
            @campaignParticipationResult={{campaignParticipationResult}}
            @trainings={{trainings}}
          />
        </template>,
      );

      // then
      assert.notOk(screen.queryByRole('tab', { name: t('pages.skill-review.tabs.trainings.tab-label') }));
    });
  });
});
