import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import { clickByLabel } from '../../../../../../helpers/click-by-label';
import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | Skill Review | Evaluation Results Hero | Retry or reset block',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    test('displays a title, a description and a message', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsHero::RetryOrResetBlock />`,
      );

      // then
      assert.dom(screen.getByText(t('pages.skill-review.hero.retry.title'))).exists();
      assert.dom(screen.getByText(t('pages.skill-review.hero.retry.description'))).exists();
      assert.dom(screen.getByText(t('pages.skill-review.reset.notifications'))).exists();

      assert.dom(screen.queryByRole('link', { name: t('pages.skill-review.hero.retry.actions.retry') })).doesNotExist();

      assert
        .dom(screen.queryByRole('button', { name: t('pages.skill-review.hero.retry.actions.reset') }))
        .doesNotExist();
    });

    module('when user can retry the assessment', function () {
      test('displays a retry link', async function (assert) {
        // given
        this.set('campaign', { code: 'CODECAMPAIGN' });
        this.set('campaignParticipationResult', { canRetry: true, canReset: false });

        // when
        const screen = await render(
          hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsHero::RetryOrResetBlock
  @campaign={{this.campaign}}
  @campaignParticipationResult={{this.campaignParticipationResult}}
/>`,
        );

        // then
        const retryLink = screen.getByRole('link', { name: t('pages.skill-review.hero.retry.actions.retry') });
        assert.dom(retryLink).exists();
        assert.dom(retryLink).hasAttribute('href', '/campagnes/CODECAMPAIGN?retry=true');

        assert
          .dom(screen.queryByRole('button', { name: t('pages.skill-review.hero.retry.actions.reset') }))
          .doesNotExist();
      });
    });

    module('when user can reset the assessment', function (hooks) {
      let screen;

      hooks.beforeEach(async function () {
        // given
        this.set('campaign', { code: 'CODECAMPAIGN', targetProfileName: 'targetProfileName' });
        this.set('campaignParticipationResult', { canRetry: false, canReset: true });

        // when
        screen = await render(
          hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsHero::RetryOrResetBlock
  @campaign={{this.campaign}}
  @campaignParticipationResult={{this.campaignParticipationResult}}
/>`,
        );
      });

      test('it should display a reset button', async function (assert) {
        // then
        assert
          .dom(screen.queryByRole('link', { name: t('pages.skill-review.hero.retry.actions.retry') }))
          .doesNotExist();
        assert.dom(screen.getByRole('button', { name: t('pages.skill-review.hero.retry.actions.reset') })).exists();
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
  },
);
