import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CampaignParticipationResetButton from 'mon-pix/components/campaigns/assessment/results-recommendation-engine/evaluation-results-hero-recommendation-engine/action-buttons/campaign-participation-reset-button';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../../helpers/setup-intl-rendering';
import { waitForDialog } from '../../../../../../../helpers/wait-for';

module(
  'Integration | Components | Campaigns | Assessment | ResultsRecommendationEngine | Campaign Participation Reset Button',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    test('it should display a reset button', async function (assert) {
      // given
      const campaign = { organizationId: 1, hasCustomResultPageButton: false };
      const campaignParticipationResult = { masteryRate: 0.75, canReset: true };

      // when
      const screen = await render(
        <template>
          <CampaignParticipationResetButton
            @campaign={{campaign}}
            @campaignParticipationResult={{campaignParticipationResult}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('button', { name: t('pages.skill-review.reset.button') })).exists();
    });

    module('when clicking on the reset button', function () {
      test('it should display a confirmation modal with a reset confirm button', async function (assert) {
        // given
        const campaign = { organizationId: 1, hasCustomResultPageButton: false };
        const campaignParticipationResult = { masteryRate: 0.75, canReset: true };

        const screen = await render(
          <template>
            <CampaignParticipationResetButton
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: t('pages.skill-review.reset.button') }));
        await waitForDialog();

        // then
        const resetConfirmationDialog = screen.getByRole('dialog', { name: t('pages.skill-review.reset.button') });
        assert.dom(within(resetConfirmationDialog).getByText(t('common.actions.confirm'))).exists();
      });
    });
  },
);
