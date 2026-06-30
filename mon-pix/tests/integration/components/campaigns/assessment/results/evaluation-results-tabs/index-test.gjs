import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import EvaluationResultsTabs from 'mon-pix/components/campaigns/assessment/results/evaluation-results-tabs/index';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Campaigns | Assessment | Results | Evaluation Results Tabs', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    class PixMetricsStub extends Service {
      trackEvent() {}
    }
    this.owner.register('service:pixMetrics', PixMetricsStub);
  });

  module('rewards tab visibility', function () {
    test('it does not display the rewards tab when there is no badge', async function (assert) {
      // given
      const campaignParticipationResult = { campaignParticipationBadges: [], competenceResults: [] };
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
      assert.dom(screen.queryByText(t('pages.skill-review.tabs.rewards.tab-label'))).doesNotExist();
    });

    test('it does not display the rewards tab when the only badge is not acquired and not always visible', async function (assert) {
      // given
      const campaignParticipationResult = {
        campaignParticipationBadges: [{ isAcquired: false, isAlwaysVisible: false }],
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
      assert.dom(screen.queryByText(t('pages.skill-review.tabs.rewards.tab-label'))).doesNotExist();
    });

    test('it displays the rewards tab when there is a not-acquired but always visible badge', async function (assert) {
      // given
      const campaignParticipationResult = {
        campaignParticipationBadges: [{ isAcquired: false, isAlwaysVisible: true, acquisitionPercentage: 50 }],
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
      assert.dom(screen.getByText(t('pages.skill-review.tabs.rewards.tab-label'))).exists();
    });

    test('it displays the rewards tab when there is an acquired badge', async function (assert) {
      // given
      const campaignParticipationResult = {
        campaignParticipationBadges: [{ isAcquired: true, isAlwaysVisible: false }],
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
      assert.dom(screen.getByText(t('pages.skill-review.tabs.rewards.tab-label'))).exists();
    });
  });
});
