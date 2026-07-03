import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import EvaluationResultsRecommendationEngine from 'mon-pix/components/routes/campaigns/assessment/evaluation-results-recommendation-engine';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | Evaluation Results Recommendation Engine',
  function (hooks) {
    setupIntlRenderingTest(hooks);
    let store, campaign;

    hooks.beforeEach(async function () {
      // given
      store = this.owner.lookup('service:store');

      campaign = store.createRecord('campaign', {
        title: 'Campagne avec recommendation de CF',
      });
    });

    module('when campaign has trainings', function () {
      test('should display trainings', async function (assert) {
        // given
        const training = store.createRecord('training', {
          title: 'Super training',
          duration: { days: 1, hours: 1, minutes: 1 },
        });

        const model = {
          campaign,
          campaignParticipationResult: {
            campaignParticipationBadges: [Symbol('badges')],
            competenceResults: [Symbol('competences')],
            reload: () => {},
          },
          trainings: [training],
        };

        // when
        const screen = await render(<template><EvaluationResultsRecommendationEngine @model={{model}} /></template>);

        // then
        assert
          .dom(
            screen.getByRole('heading', { name: t('pages.skill-review.recommended-engine.trainings.title'), level: 2 }),
          )
          .exists();
        const trainingTitle = screen.getAllByText('Super training');
        assert.strictEqual(trainingTitle.length, 2);
      });

      module('tracking', function (hooks) {
        let observerCallback;
        let observerInstance;

        hooks.beforeEach(function () {
          observerInstance = {
            observe: sinon.stub(),
            disconnect: sinon.stub(),
          };

          window.IntersectionObserver = function (callback) {
            observerCallback = callback;
            return observerInstance;
          };
        });

        hooks.afterEach(function () {
          delete window.IntersectionObserver;
          sinon.restore();
        });

        test('it should send tracking when drawer is displayed', async function (assert) {
          // given
          const training = store.createRecord('training', {
            title: 'Super training',
            duration: { days: 1, hours: 1, minutes: 1 },
          });

          const model = {
            campaign,
            campaignParticipationResult: {
              campaignParticipationBadges: [Symbol('badges')],
              competenceResults: [Symbol('competences')],
              reload: () => {},
            },
            trainings: [training],
          };

          const pixMetrics = this.owner.lookup('service:pix-metrics');
          pixMetrics.trackEvent = sinon.stub();

          // when
          await render(<template><EvaluationResultsRecommendationEngine @model={{model}} /></template>);
          observerCallback([{ isIntersecting: true }]);

          //then
          sinon.assert.calledWith(pixMetrics.trackEvent, 'Moteur de reco - affichage du feedback NPS');
          assert.ok(true);
        });
      });
    });

    module('when campaign has no training', function () {
      test('should not display trainings section and the drawer', async function (assert) {
        // given
        const model = {
          campaign,
          campaignParticipationResult: {
            campaignParticipationBadges: [Symbol('badges')],
            competenceResults: [Symbol('competences')],
            reload: () => {},
          },
          trainings: [],
        };

        // when
        const screen = await render(<template><EvaluationResultsRecommendationEngine @model={{model}} /></template>);

        // then
        assert
          .dom(screen.queryByRole('heading', { name: t('pages.skill-review.tabs.trainings.title'), level: 2 }))
          .doesNotExist();

        assert
          .dom(screen.queryByRole('dialog', { name: t('pages.skill-review.recommended-engine.drawer.title') }))
          .doesNotExist();
      });
    });

    test('should display results', async function (assert) {
      // given
      const model = {
        campaign,
        campaignParticipationResult: {
          campaignParticipationBadges: [Symbol('badges')],
          competenceResults: [Symbol('competences')],
          reload: () => {},
        },
        trainings: [],
      };

      // when
      const screen = await render(<template><EvaluationResultsRecommendationEngine @model={{model}} /></template>);

      // then
      assert
        .dom(screen.getByRole('heading', { name: t('pages.skill-review.tabs.results-details.title'), level: 2 }))
        .exists();
    });

    module('when campaign has campaign participation badges', function () {
      test('should display badges', async function (assert) {
        // given
        const acquiredBadge = store.createRecord('campaign-participation-badge', {
          isAcquired: true,
          altMessage: 'Badge alt text',
          imageUrl: '/images/background/hexa-pix.svg',
        });

        const model = {
          campaign,
          campaignParticipationResult: {
            campaignParticipationBadges: [acquiredBadge],
            competenceResults: [Symbol('competences')],
            reload: () => {},
          },
          trainings: [],
        };

        // when
        const screen = await render(<template><EvaluationResultsRecommendationEngine @model={{model}} /></template>);

        // then
        assert
          .dom(screen.getByRole('heading', { name: t('pages.skill-review.tabs.rewards.title'), level: 2 }))
          .exists();
      });
    });

    module('when campaign has no campaign participation badge', function () {
      test('should display nothing', async function (assert) {
        // given
        const model = {
          campaign,
          campaignParticipationResult: {
            campaignParticipationBadges: [],
            competenceResults: [Symbol('competences')],
            reload: () => {},
          },
          trainings: [],
        };

        // when
        const screen = await render(<template><EvaluationResultsRecommendationEngine @model={{model}} /></template>);

        // then
        assert
          .dom(screen.queryByRole('heading', { name: t('pages.skill-review.tabs.rewards.title'), level: 2 }))
          .doesNotExist();
      });
    });
  },
);
