import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import RetryOrResetBlock from 'mon-pix/components/campaigns/assessment/results/evaluation-results-hero/retry-or-reset-block';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { clickByLabel } from '../../../../../../helpers/click-by-label';
import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | Results | Evaluation Results Hero | Retry or reset block',
  function (hooks) {
    let clock;
    const state = {};

    setupIntlRenderingTest(hooks);

    hooks.beforeEach(function () {
      clock = sinon.useFakeTimers({ toFake: ['Date'] });
    });
    hooks.afterEach(function () {
      clock.restore();
    });

    test('displays a title, a description and a message', async function (assert) {
      // given
      const campaign = {};
      const campaignParticipationResult = { canRetry: true, canReset: false };

      // when
      const screen = await render(
        <template>
          <RetryOrResetBlock @campaign={{campaign}} @campaignParticipationResult={{campaignParticipationResult}} />
        </template>,
      );

      // then
      assert.dom(screen.getByText(t('pages.skill-review.hero.retry.title'))).exists();
      assert.dom(screen.getByText(t('pages.skill-review.hero.retry.description'))).exists();

      assert.dom(screen.getByText(t('pages.skill-review.retry.notification'))).exists();

      assert.dom(screen.queryByRole('link', { name: t('pages.skill-review.hero.retry.actions.retry') })).doesNotExist();

      assert
        .dom(screen.queryByRole('button', { name: t('pages.skill-review.hero.retry.actions.reset') }))
        .doesNotExist();
    });

    module('when user retry the assessment but delay before retrying is not passed', function () {
      test('displays a disabled button', async function (assert) {
        // given
        const campaign = { code: 'CODECAMPAIGN' };
        const campaignParticipationResult = {
          canRetry: true,
          canReset: false,
          remainingSecondsBeforeRetrying: '90',
        };

        // when
        const screen = await render(
          <template>
            <RetryOrResetBlock @campaign={{campaign}} @campaignParticipationResult={{campaignParticipationResult}} />
          </template>,
        );

        // then
        const retryButton = screen.getByRole('button', { name: t('pages.skill-review.hero.retry.actions.retry') });
        assert.dom(retryButton).hasAttribute('aria-disabled', 'true');

        assert
          .dom(screen.queryByRole('button', { name: t('pages.skill-review.hero.retry.actions.reset') }))
          .doesNotExist();
        assert.dom(screen.getByText(t('pages.skill-review.retry.notification'))).exists();
      });

      test('should display remaining time', async function (assert) {
        // given
        const campaign = { code: 'CODECAMPAIGN' };
        const campaignParticipationResult = {
          canRetry: true,
          canReset: false,
          remainingSecondsBeforeRetrying: '90',
        };

        // when
        const screen = await render(
          <template>
            <RetryOrResetBlock @campaign={{campaign}} @campaignParticipationResult={{campaignParticipationResult}} />
          </template>,
        );
        // then
        assert.ok(
          await screen.findByText(t('pages.skill-review.hero.retry.retryIn', { duration: '2 minutes' }), {
            exact: false,
          }),
        );
      });
    });

    module('when user can only retry the assessment', function (hooks) {
      hooks.beforeEach(function () {
        state.campaign = { code: 'CODECAMPAIGN' };
        state.campaignParticipationResult = { canRetry: true, canReset: false };
      });

      test('displays a retry link and not reset button', async function (assert) {
        // when
        const screen = await render(
          <template>
            <RetryOrResetBlock
              @campaign={{state.campaign}}
              @campaignParticipationResult={{state.campaignParticipationResult}}
            />
          </template>,
        );

        // then
        const retryLink = screen.getByRole('link', { name: t('pages.skill-review.hero.retry.actions.retry') });
        assert.dom(retryLink).exists();
        assert.dom(retryLink).hasAttribute('href', '/campagnes/CODECAMPAIGN?retry=true');
        assert
          .dom(screen.queryByRole('button', { name: t('pages.skill-review.hero.retry.actions.reset') }))
          .doesNotExist();
        assert.dom(screen.getByText(t('pages.skill-review.retry.notification'))).exists();
      });
    });

    module('when user can only reset the assessment', function (hooks) {
      let screen;

      hooks.beforeEach(async function () {
        // given
        state.campaign = { code: 'CODECAMPAIGN', targetProfileName: 'targetProfileName' };
        state.campaignParticipationResult = { canRetry: false, canReset: true };

        // when
        screen = await render(
          <template>
            <RetryOrResetBlock
              @campaign={{state.campaign}}
              @campaignParticipationResult={{state.campaignParticipationResult}}
            />
          </template>,
        );
      });

      test('it should display a reset button', async function (assert) {
        // then
        assert
          .dom(screen.queryByRole('link', { name: t('pages.skill-review.hero.retry.actions.retry') }))
          .doesNotExist();
        assert.dom(screen.getByRole('button', { name: t('pages.skill-review.hero.retry.actions.reset') })).exists();
        assert.dom(screen.getByText(t('pages.skill-review.reset.notification'))).exists();
      });

      test('it should open a modal when user wants to reset the assessment', async function (assert) {
        // then
        clickByLabel(t('pages.skill-review.hero.retry.actions.reset'));
        await screen.findByRole('dialog');

        assert.dom(screen.getByRole('heading', { level: 1, name: t('pages.skill-review.reset.button') })).exists();
        assert.dom(screen.getByText(t('pages.skill-review.reset.modal.warning-text'))).exists();
        assert.dom(screen.getByText('Vous êtes sur le point de remettre à zéro votre', { exact: false })).exists();
        assert.dom(screen.getByText('targetProfileName', { exact: false })).exists();

        const linkButton = screen.getByRole('link', { name: 'Confirmer' });
        assert.dom(linkButton).exists();
        assert.dom(linkButton).hasAttribute('href', '/campagnes/CODECAMPAIGN?reset=true');
        assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      });
    });

    module('when user can retry and reset the assessment', function (hooks) {
      let screen;

      hooks.beforeEach(async function () {
        // given
        state.campaign = { code: 'CODECAMPAIGN', targetProfileName: 'targetProfileName' };
        state.campaignParticipationResult = { canRetry: true, canReset: true };

        // when
        screen = await render(
          <template>
            <RetryOrResetBlock
              @campaign={{state.campaign}}
              @campaignParticipationResult={{state.campaignParticipationResult}}
            />
          </template>,
        );
      });

      test('it should display a retry and reset button', async function (assert) {
        // then
        assert.dom(screen.getByRole('link', { name: t('pages.skill-review.hero.retry.actions.retry') })).exists();
        assert.dom(screen.getByRole('button', { name: t('pages.skill-review.hero.retry.actions.reset') })).exists();
        assert.dom(screen.getByText(t('pages.skill-review.retry-and-reset.notification'))).exists();
      });
    });
  },
);
