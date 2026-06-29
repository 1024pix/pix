import { render, within } from '@1024pix/ember-testing-library';
import { A } from '@ember/array';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ScorecardDetails from 'mon-pix/components/scorecard-details';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | scorecard-details', function (hooks) {
  setupIntlRenderingTest(hooks);

  const state = {};

  module('Component rendering', function () {
    test('should display the competence information', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const scorecard = store.createRecord('scorecard', {
        name: 'Scorecard name',
        description: 'Scorecard description',
      });

      // when
      const screen = await render(<template><ScorecardDetails @scorecard={{scorecard}} /></template>);

      // then
      assert.ok(screen.getByRole('heading', { name: 'Scorecard name' }));
      assert.ok(screen.getByText('Scorecard description'));
    });

    test('should display the scorecard level, earnedPix and remainingPixToNextLevel', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const scorecard = store.createRecord('scorecard', {
        level: 2,
        earnedPix: 22,
        pixScoreAheadOfNextLevel: 6,
        remainingPixToNextLevel: 2,
        isStarted: true,
        isProgressable: true,
      });

      // when
      const screen = await render(<template><ScorecardDetails @scorecard={{scorecard}} /></template>);

      // then
      const remainingPixToNextLevel = 2;
      const earnedPix = 22;
      assert.ok(screen.getByText(remainingPixToNextLevel));
      assert.ok(screen.getByText(earnedPix));
      assert.ok(screen.getByText('2 pix avant le niveau 3'));
    });

    test('should display a dash instead of the scorecard level and earnedPix if they are set to zero', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const scorecard = store.createRecord('scorecard', {
        level: 0,
        earnedPix: 0,
        isFinished: true,
      });

      // when
      const screen = await render(<template><ScorecardDetails @scorecard={{scorecard}} /></template>);

      // then
      assert.strictEqual(screen.getAllByText('–').length, 2);
    });

    module('When the user has finished a competence', function (hooks) {
      hooks.beforeEach(function () {
        // given
        const store = this.owner.lookup('service:store');
        state.scorecard = store.createRecord('scorecard', {
          pixScoreAheadOfNextLevel: 7,
          level: 3,
          isFinished: true,
          tutorials: [],
          save: sinon.stub().resolves(),
        });

        this.owner.register(
          'service:current-user',
          class UserService extends Service {
            user = { id: 123 };
          },
        );
      });

      test('should not display remainingPixToNextLevel', async function (assert) {
        // when
        await render(<template><ScorecardDetails @scorecard={{state.scorecard}} /></template>);

        // then
        assert.dom('.scorecard-details-content-right__level-info').doesNotExist();
      });

      test('should not display a button', async function (assert) {
        // when
        const screen = await render(<template><ScorecardDetails @scorecard={{state.scorecard}} /></template>);

        // then
        assert.dom(screen.queryByRole('link', { name: 'Reprendre' })).doesNotExist();
        assert.dom(screen.queryByRole('link', { name: 'Commencer' })).doesNotExist();
      });

      test('should show the improving button if the remaining days before improving are equal to 0', async function (assert) {
        // given
        state.scorecard.isImprovable = true;
        state.scorecard.remainingDaysBeforeImproving = 0;
        state.scorecard.pixScoreAheadOfNextLevel = 8;

        // when
        const screen = await render(<template><ScorecardDetails @scorecard={{state.scorecard}} /></template>);

        // then
        assert.ok(screen.getByRole('button', t('pages.competence-details.actions.improve.label')));
      });

      test('should track improve competence button click', async function (assert) {
        // given
        const pixMetrics = this.owner.lookup('service:pix-metrics');
        const trackEventStub = sinon.stub(pixMetrics, 'trackEvent');
        const competenceEvaluation = this.owner.lookup('service:competence-evaluation');
        sinon.stub(competenceEvaluation, 'improve').resolves();

        state.scorecard.isImprovable = true;
        state.scorecard.remainingDaysBeforeImproving = 0;
        state.scorecard.pixScoreAheadOfNextLevel = 8;
        const screen = await render(<template><ScorecardDetails @scorecard={{state.scorecard}} /></template>);

        // when
        await click(
          screen.getByRole('button', { name: new RegExp(t('pages.competence-details.actions.improve.label')) }),
        );

        // then
        assert.ok(
          trackEventStub.calledWithExactly('improveCompetence', { competenceId: state.scorecard.competenceId }),
        );
        assert.ok(
          competenceEvaluation.improve.calledWithExactly({
            userId: 123,
            competenceId: state.scorecard.competenceId,
            scorecardId: state.scorecard.id,
          }),
        );
      });

      test('should track reset competence button click', async function (assert) {
        // given
        const pixMetrics = this.owner.lookup('service:pix-metrics');
        const trackEventStub = sinon.stub(pixMetrics, 'trackEvent');

        state.scorecard.isResettable = true;
        state.scorecard.remainingDaysBeforeReset = 0;
        const screen = await render(<template><ScorecardDetails @scorecard={{state.scorecard}} /></template>);

        // when
        await click(
          screen.getByRole('button', { name: new RegExp(t('pages.competence-details.actions.reset.label')) }),
        );
        const dialog = await screen.findByRole('dialog');
        await click(within(dialog).getByRole('button', { name: t('pages.competence-details.actions.reset.label') }));
        // then
        assert.ok(trackEventStub.calledWithExactly('resetCompetence', { competenceId: state.scorecard.competenceId }));
      });

      test('should show the improving countdown if the remaining days before improving are different than 0', async function (assert) {
        // given
        state.scorecard.remainingDaysBeforeImproving = 3;
        state.scorecard.pixScoreAheadOfNextLevel = 3;

        // when
        const screen = await render(<template><ScorecardDetails @scorecard={{state.scorecard}} /></template>);

        // then
        assert.ok(screen.getByText('Tenter le niveau supérieur dans'));
        assert.ok(screen.getByText('3 jours.'));
      });

      module('and the user has reached the max level', function (hooks) {
        hooks.beforeEach(function () {
          // given
          const store = this.owner.lookup('service:store');
          state.scorecard = store.createRecord('scorecard', {
            pixScoreAheadOfNextLevel: 7,
            level: 5,
            isFinished: true,
            isFinishedWithMaxLevel: true,
            tutorials: [],
          });
        });

        test('should not display remainingPixToNextLevel', async function (assert) {
          // when
          await render(<template><ScorecardDetails @scorecard={{state.scorecard}} /></template>);

          // then
          assert.dom('.scorecard-details-content-right__level-info').doesNotExist();
        });

        test('should show congrats design', async function (assert) {
          // when
          await render(<template><ScorecardDetails @scorecard={{state.scorecard}} /></template>);

          // then
          assert.dom('.competence-card__congrats').exists();
        });

        test('should not show the improving button', async function (assert) {
          // when
          const screen = await render(<template><ScorecardDetails @scorecard={{state.scorecard}} /></template>);

          // then
          assert.dom(screen.queryByRole('button', { name: 'Retenter' })).doesNotExist();
        });
      });
    });

    module('When the user did not started a competence', function () {
      test('should not display the level and remainingPixToNextLevel if scorecard.isNotStarted is true', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const scorecard = store.createRecord('scorecard', {
          pixScoreAheadOfNextLevel: 7,
          isNotStarted: true,
        });

        // when
        await render(<template><ScorecardDetails @scorecard={{scorecard}} /></template>);

        // then
        assert.dom('.scorecard-details-content-right__score-container').doesNotExist();
        assert.dom('.scorecard-details-content-right__level-info').doesNotExist();
      });

      test('should display a button stating "Commencer" if scorecard.isStarted is false', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const scorecard = store.createRecord('scorecard', {
          name: 'competence1',
          competenceId: 1,
          isNotStarted: true,
        });

        // when
        const screen = await render(<template><ScorecardDetails @scorecard={{scorecard}} /></template>);

        // then
        assert.ok(
          screen.getByRole('link', {
            name: `${t('pages.competence-details.actions.start.label')} ${t('pages.competence-details.for-competence', {
              competence: scorecard.name,
            })}`,
          }),
        );
      });
    });

    module('When the user has started a competence', function () {
      test('should display a button stating "Reprendre"', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const scorecard = store.createRecord('scorecard', {
          name: 'competence1',
          competenceId: 1,
          isStarted: true,
        });

        // when
        const screen = await render(<template><ScorecardDetails @scorecard={{scorecard}} /></template>);

        // then
        assert.ok(
          screen.getByRole('link', {
            name: `${t('pages.competence-details.actions.continue.label')} ${t(
              'pages.competence-details.for-competence',
              { competence: scorecard.name },
            )}`,
          }),
        );
      });

      test('should not display the tutorial section when there is no tutorial to show', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const scorecard = store.createRecord('scorecard', {
          competenceId: 1,
          isStarted: true,
        });

        // when
        const screen = await render(<template><ScorecardDetails @scorecard={{scorecard}} /></template>);

        // then
        assert.dom(screen.queryByRole('heading', { name: 'Cultivez vos compétences', level: 2 })).doesNotExist();
      });

      module('and the user has some tutorials', function () {
        test('should display the tutorial section and the related tutorials', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const tuto1 = store.createRecord('tutorial', {
            title: 'Tuto 1.1',
            link: 'https://example.net/1',
            tubeName: '@first_tube',
            tubePracticalTitle: 'Practical Title',
            duration: '00:15:10',
            format: 'video',
          });
          const tuto2 = store.createRecord('tutorial', {
            title: 'Tuto 2.1',
            link: 'https://example.net/2',
            tubeName: '@second_tube',
            tubePracticalTitle: 'Practical Title 1',
            duration: '00:04:00',
            format: 'page',
          });
          const tuto3 = store.createRecord('tutorial', {
            title: 'Tuto 2.2',
            link: 'https://example.net/3',
            tubeName: '@second_tube',
            tubePracticalTitle: 'Practical Title',
            duration: '00:04:00',
            format: 'page',
          });

          const tutorials = A([tuto1, tuto2, tuto3]);

          const scorecard = store.createRecord('scorecard', {
            competenceId: 1,
            isStarted: true,
            tutorials,
          });

          // when
          const screen = await render(<template><ScorecardDetails @scorecard={{scorecard}} /></template>);

          // then
          assert.dom(screen.getByRole('heading', { name: 'Cultivez vos compétences', level: 2 })).exists();
          assert.dom(screen.getByRole('heading', { name: 'Practical Title', level: 3 })).exists();
          assert.dom(screen.getByRole('heading', { name: 'Practical Title 1', level: 3 })).exists();
          assert.dom(screen.getByRole('heading', { name: 'Tuto 2.1', level: 4 })).exists();
          assert.dom(screen.getByRole('heading', { name: 'Tuto 2.2', level: 4 })).exists();
          assert
            .dom(screen.getByText('Voici une sélection de tutos qui pourront vous aider à gagner des Pix.'))
            .exists();
        });
      });
    });
  });
});
