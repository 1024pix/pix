import { render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, settled } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl/test-support';
import EvaluationResultsHeroRecommendationEngine from 'mon-pix/components/campaigns/assessment/results-recommendation-engine/evaluation-results-hero-recommendation-engine/index';
import { module, test } from 'qunit';

import { stubCurrentUserService } from '../../../../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';
import { waitForDialog } from '../../../../../../helpers/wait-for';

module(
  'Integration | Components | Campaigns | Assessment | ResultsRecommendationEngine | EvaluationResultsHeroRecommendationEngine',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    module('global behaviour', function (hooks) {
      hooks.beforeEach(async function () {
        stubCurrentUserService(this.owner, { id: 1, firstName: 'Hermione' });
      });

      module('when screen is mobile', function () {
        test('it display a separator', async function (assert) {
          // given
          const campaign = { organizationId: 1 };
          const campaignParticipationResult = { masteryRate: 0.755 };

          this.owner.register(
            'service:media',
            class MediaService extends Service {
              isMobile = true;
            },
          );

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHeroRecommendationEngine
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
              />
            </template>,
          );

          // then
          assert.dom(screen.getByRole('separator')).exists();
        });
      });

      module('when screen is not mobile', function () {
        test('it does not display a separator', async function (assert) {
          // given
          const campaign = { organizationId: 1 };
          const campaignParticipationResult = { masteryRate: 0.755 };

          this.owner.register(
            'service:media',
            class MediaService extends Service {
              isMobile = false;
            },
          );

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHeroRecommendationEngine
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
              />
            </template>,
          );

          // then
          assert.dom(screen.queryByRole('separator')).doesNotExist();
        });
      });

      test('it displays a congratulation title', async function (assert) {
        // given
        const campaign = { organizationId: 1 };
        const campaignParticipationResult = { masteryRate: 0.755 };

        // when
        const screen = await render(
          <template>
            <EvaluationResultsHeroRecommendationEngine
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
            />
          </template>,
        );

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: t('pages.skill-review.hero.thanks', { name: 'Hermione' }).replace('\n', ''),
            }),
          )
          .exists();
      });

      test('it displays a rounded mastery rate', async function (assert) {
        // given
        const campaign = { organizationId: 1 };
        const campaignParticipationResult = { masteryRate: 0.755 };

        // when
        const screen = await render(
          <template>
            <EvaluationResultsHeroRecommendationEngine
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
            />
          </template>,
        );

        // then
        const masteryRateElementWithoutWhiteSpaceTrimmed = screen.getByText('76').textContent.replace(/\s/g, '').trim();
        assert.strictEqual(masteryRateElementWithoutWhiteSpaceTrimmed, '76%');
        assert.dom(screen.getByText(t('pages.skill-review.hero.mastery-rate'))).exists();
      });
    });

    module('stages', function () {
      module('when there are multiple stages', function () {
        test('it displays reached stage stars and message', async function (assert) {
          // given
          const campaign = { organizationId: 1 };
          const campaignParticipationResult = {
            hasReachedStage: true,
            reachedStage: {
              reachedStage: 4,
              totalStage: 5,
              message: 'existing message stages',
              title: 'existing title stages',
            },
          };

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHeroRecommendationEngine
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
              />
            </template>,
          );

          // then
          const stars = { acquired: 3, total: 4 };
          assert.dom(screen.getByText(t('pages.skill-review.stage.starsAcquired', stars))).exists();
          assert.dom(screen.getByText(t('pages.skill-review.stage.recommendedEngine.starsAcquired', stars))).exists();

          assert.dom(screen.getByText(campaignParticipationResult.reachedStage.title)).exists();
          assert.dom(screen.getByText(campaignParticipationResult.reachedStage.message)).exists();
        });
      });

      module('when there is only one stage', function () {
        test('it does not display stars', async function (assert) {
          // given
          const campaign = { organizationId: 1 };
          const campaignParticipationResult = {
            hasReachedStage: true,
            reachedStage: { reachedStage: 1, totalStage: 1 },
          };

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHeroRecommendationEngine
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
              />
            </template>,
          );

          // then
          const stars = { acquired: 0, total: 0 };
          assert.dom(screen.queryByText(t('pages.skill-review.stage.starsAcquired', stars))).doesNotExist();
        });
      });

      module('when there is no stage', function () {
        test('it does not display stars', async function (assert) {
          // given
          const campaign = { organizationId: 1 };
          const campaignParticipationResult = { hasReachedStage: false };

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHeroRecommendationEngine
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
              />
            </template>,
          );

          // then
          assert
            .dom(screen.queryByText(t('pages.skill-review.stage.starsAcquired', { acquired: 0, total: 0 })))
            .doesNotExist();
        });
      });
    });

    module('acquired badges', function () {
      module('when there is at least one acquired badge', function () {
        test('it displays the compact badges list', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const acquiredBadge = store.createRecord('campaign-participation-badge', {
            isAcquired: true,
            altMessage: 'Badge alt text',
            imageUrl: '/images/background/hexa-pix.svg',
          });
          const campaignParticipationResult = store.createRecord('campaign-participation-result', {
            campaignParticipationBadges: [acquiredBadge],
          });
          const campaign = { organizationId: 1 };

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHeroRecommendationEngine
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
              />
            </template>,
          );

          // then
          assert.dom(screen.getByRole('img', { name: 'Badge alt text' })).exists();
        });
      });

      module('when there is no acquired badge', function () {
        test('it does not display the badges list', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const notAcquiredBadge = store.createRecord('campaign-participation-badge', { isAcquired: false });
          const campaignParticipationResult = store.createRecord('campaign-participation-result', {
            campaignParticipationBadges: [notAcquiredBadge],
          });
          const campaign = { organizationId: 1 };

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHeroRecommendationEngine
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
              />
            </template>,
          );

          // then
          assert.dom(screen.queryByRole('list')).doesNotExist();
        });
      });
    });

    module('staged message toggle button', function (hooks) {
      hooks.beforeEach(async function () {
        // given
        stubCurrentUserService(this.owner, { id: 1, firstName: 'Hermione' });

        this.owner.register(
          'service:media',
          class MediaService extends Service {
            @tracked isMobile = false;
          },
        );

        const campaign = { organizationId: 1 };
        const campaignParticipationResult = {
          hasReachedStage: true,
          reachedStage: {
            reachedStage: 4,
            totalStage: 5,
            message: 'existing message',
            title: 'existing title',
          },
        };

        // when
        this.screen = await render(
          <template>
            <EvaluationResultsHeroRecommendationEngine
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
            />
          </template>,
        );
      });

      test('it does not display the toggle button when not on mobile', async function (assert) {
        // then
        assert
          .dom(this.screen.queryByRole('button', { name: t('pages.skill-review.hero.staged-message.show-more') }))
          .doesNotExist();
      });

      module('when on mobile and content overflows', function (hooks) {
        hooks.beforeEach(async function () {
          const contentEl = document.getElementById(
            'evaluation-results-hero-recommendation-engine-staged-message-content',
          );
          Object.defineProperty(contentEl, 'scrollHeight', { value: 200, configurable: true });

          const mediaService = this.owner.lookup('service:media');
          mediaService.isMobile = true;
          await settled();
        });

        test('it displays the "show-more" button', async function (assert) {
          // then
          assert
            .dom(this.screen.getByRole('button', { name: t('pages.skill-review.hero.staged-message.show-more') }))
            .exists();
        });

        test('clicking the button changes its label to "show-less"', async function (assert) {
          // then
          await click(this.screen.getByRole('button', { name: t('pages.skill-review.hero.staged-message.show-more') }));

          assert
            .dom(this.screen.getByRole('button', { name: t('pages.skill-review.hero.staged-message.show-less') }))
            .exists();
        });

        test('clicking "show-less" toggles back to "show-more"', async function (assert) {
          // then
          await click(this.screen.getByRole('button', { name: t('pages.skill-review.hero.staged-message.show-more') }));
          await click(this.screen.getByRole('button', { name: t('pages.skill-review.hero.staged-message.show-less') }));

          assert
            .dom(this.screen.getByRole('button', { name: t('pages.skill-review.hero.staged-message.show-more') }))
            .exists();
        });
      });
    });

    test('it displays a back-to-homepage link', async function (assert) {
      // given
      stubCurrentUserService(this.owner, { firstName: 'Hermione' });
      const campaign = { organizationId: 1, hasCustomResultPageButton: false };
      const campaignParticipationResult = { masteryRate: 0.75 };

      // when
      const screen = await render(
        <template>
          <EvaluationResultsHeroRecommendationEngine
            @campaign={{campaign}}
            @campaignParticipationResult={{campaignParticipationResult}}
            @hasTrainings={{false}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('link', { name: t('pages.skill-review.actions.back-to-pix') })).exists();
      assert.dom(screen.queryByRole('button', { name: t('pages.skill-review.hero.see-trainings') })).doesNotExist();
    });

    module('when campaign can be reset', function (hooks) {
      hooks.beforeEach(async function () {
        stubCurrentUserService(this.owner, { firstName: 'Hermione' });
      });

      test('it should display a reset button', async function (assert) {
        // given
        const campaign = { organizationId: 1, hasCustomResultPageButton: false };
        const campaignParticipationResult = { masteryRate: 0.75, canReset: true };

        // when
        const screen = await render(
          <template>
            <EvaluationResultsHeroRecommendationEngine
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
              @hasTrainings={{false}}
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

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHeroRecommendationEngine
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
                @hasTrainings={{false}}
              />
            </template>,
          );

          await click(screen.getByRole('button', { name: t('pages.skill-review.reset.button') }));

          await waitForDialog();
          assert.dom(screen.getByRole('dialog', { name: t('pages.skill-review.reset.button') })).exists();

          const resetConfirmationDialog = screen.getByRole('dialog', { name: t('pages.skill-review.reset.button') });
          assert.dom(within(resetConfirmationDialog).getByText(t('common.actions.confirm'))).exists();
        });
      });
    });
  },
);
