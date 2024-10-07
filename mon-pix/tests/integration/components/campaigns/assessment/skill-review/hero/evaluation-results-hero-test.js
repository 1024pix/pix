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

  module('acquired badges', function () {
    module('when there is at least one acquired badge', function () {
      test('should display the acquired badges block', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const acquiredBadge = store.createRecord('campaign-participation-badge', { isAcquired: true });
        const campaignParticipationResult = store.createRecord('campaign-participation-result', {
          campaignParticipationBadges: [acquiredBadge],
        });
        this.set('campaignParticipationResult', campaignParticipationResult);

        // when
        const screen = await render(
          hbs`
            <Campaigns::Assessment::SkillReview::EvaluationResultsHero
              @campaignParticipationResult={{this.campaignParticipationResult}}
            />`,
        );

        // then
        const badgesTitle = screen.getByRole('heading', {
          name: t('pages.skill-review.hero.acquired-badges-title'),
        });
        assert.dom(badgesTitle).exists();
      });
    });

    module('when there is no acquired badge', function () {
      test('should not display the acquired badges block', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const notAquiredBadge = store.createRecord('campaign-participation-badge', { isAcquired: false });
        const campaignParticipationResult = store.createRecord('campaign-participation-result', {
          campaignParticipationBadges: [notAquiredBadge],
        });
        this.set('campaignParticipationResult', campaignParticipationResult);

        // when
        const screen = await render(
          hbs`
            <Campaigns::Assessment::SkillReview::EvaluationResultsHero
              @campaignParticipationResult={{this.campaignParticipationResult}}
            />`,
        );

        // then
        const badgesTitle = screen.queryByRole('heading', {
          name: t('pages.skill-review.hero.acquired-badges-title'),
        });
        assert.dom(badgesTitle).doesNotExist();
      });
    });
  });

  module('when there is some custom organization content', function () {
    test('it should display the organization block', async function (assert) {
      //given
      this.set('campaign', {
        customResultPageText: 'My custom result page text',
      });

      this.set('campaignParticipationResult', { masteryRate: 0.75 });

      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsHero
          @campaign={{this.campaign}}
          @campaignParticipationResult={{this.campaignParticipationResult}}
        />`,
      );

      // then
      assert.dom(screen.getByText(t('pages.skill-review.organization-message'))).exists();
      assert.dom(screen.getByText('My custom result page text')).exists();
    });
  });
});
