import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Campaigns | Assessment | Skill Review | Evaluation Results Hero', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('global behaviour', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      // given
      class currentUserService extends Service {
        user = {
          firstName: 'Hermione',
        };
      }

      this.owner.register('service:currentUser', currentUserService);

      this.set('campaignParticipationResult', { masteryRate: 0.755 });

      // when
      screen = await render(
        hbs`
          <Campaigns::Assessment::SkillReview::EvaluationResultsHero
            @campaignParticipationResult={{this.campaignParticipationResult}}
          />`,
      );
    });

    test('it should display a congratulation title', async function (assert) {
      // then
      const title = screen.getByRole('heading', {
        name: t('pages.skill-review.hero.bravo', { name: 'Hermione' }),
      });
      assert.dom(title).exists();
    });

    test('it should display a rounded mastery rate', async function (assert) {
      // then
      const masteryRateElement = screen.getByText('76');
      assert.strictEqual(masteryRateElement.textContent, '76%');

      assert.dom(screen.getByText(t('pages.skill-review.hero.mastery-rate'))).exists();
    });
  });

  module('stages', function () {
    module('when there are stages', function () {
      test('displays reached stage stars and message', async function (assert) {
        // given
        this.set('campaignParticipationResult', {
          hasReachedStage: true,
          reachedStage: { reachedStage: 4, totalStage: 5, message: 'lorem ipsum dolor sit amet' },
        });

        // when
        const screen = await render(
          hbs`
            <Campaigns::Assessment::SkillReview::EvaluationResultsHero
              @campaignParticipationResult={{this.campaignParticipationResult}}
            />`,
        );

        // then
        const stars = {
          acquired: this.campaignParticipationResult.reachedStage.reachedStage - 1,
          total: this.campaignParticipationResult.reachedStage.totalStage - 1,
        };
        assert.strictEqual(screen.getAllByText(t('pages.skill-review.stage.starsAcquired', stars)).length, 2);

        assert.dom(screen.getByText(this.campaignParticipationResult.reachedStage.message)).exists();
      });
    });

    module('when there is only one stage', function () {
      test('displays the stage 0 message but no stars', async function (assert) {
        // given
        this.set('campaignParticipationResult', {
          hasReachedStage: true,
          reachedStage: { reachedStage: 1, totalStage: 1, message: 'Stage 0 message' },
        });

        // when
        const screen = await render(
          hbs`
            <Campaigns::Assessment::SkillReview::EvaluationResultsHero
              @campaignParticipationResult={{this.campaignParticipationResult}}
            />`,
        );

        // then
        const stars = {
          acquired: this.campaignParticipationResult.reachedStage.reachedStage - 1,
          total: this.campaignParticipationResult.reachedStage.totalStage - 1,
        };
        assert.dom(screen.queryByText(t('pages.skill-review.stage.starsAcquired', stars))).doesNotExist();

        assert.dom(screen.getByText(this.campaignParticipationResult.reachedStage.message)).exists();
      });
    });

    module('when there is no stage', function () {
      test('not display stars and message', async function (assert) {
        // given
        this.set('campaign', { organizationId: 1 });
        this.set('campaignParticipationResult', {
          hasReachedStage: false,
          reachedStage: { message: 'not existing message' },
        });

        // when
        const screen = await render(
          hbs`
            <Campaigns::Assessment::SkillReview::EvaluationResultsHero
              @campaign={{this.campaign}}
              @campaignParticipationResult={{this.campaignParticipationResult}}
            />`,
        );

        // then
        const stars = { acquired: 0, total: 0 };
        assert.dom(screen.queryByText(t('pages.skill-review.stage.starsAcquired', stars))).doesNotExist();

        assert.dom(screen.queryByTestId('stage-message')).doesNotExist();
      });
    });
  });
});
