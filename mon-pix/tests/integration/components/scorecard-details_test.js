import { module, test } from 'qunit';
import { A } from '@ember/array';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | scorecard-details', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function () {
    test('should display the scorecard header with area color', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const scorecard = store.createRecord('scorecard', {
        area: store.createRecord('area', {
          title: 'Area title',
          color: 'jaffa',
        }),
      });

      this.set('scorecard', scorecard);

      // when
      const screen = await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

      // then
      assert.ok(
        screen.getByText('Area title').getAttribute('class').includes('scorecard-details-content-left__area--jaffa')
      );
    });

    test('should display the competence information', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const scorecard = store.createRecord('scorecard', {
        name: 'Scorecard name',
        description: 'Scorecard description',
      });

      this.set('scorecard', scorecard);

      // when
      const screen = await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

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

      this.set('scorecard', scorecard);

      // when
      const screen = await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

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

      this.set('scorecard', scorecard);

      // when
      const screen = await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

      // then
      assert.strictEqual(screen.getAllByText('–').length, 2);
    });

    module('When the user has finished a competence', function (hooks) {
      let scorecard;

      hooks.beforeEach(function () {
        // given
        const store = this.owner.lookup('service:store');
        scorecard = store.createRecord('scorecard', {
          pixScoreAheadOfNextLevel: 7,
          level: 3,
          isFinished: true,
          tutorials: [],
        });
      });

      test('should not display remainingPixToNextLevel', async function (assert) {
        // given
        this.set('scorecard', scorecard);

        // when
        await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.dom('.scorecard-details-content-right__level-info').doesNotExist();
      });

      test('should not display a button', async function (assert) {
        // when
        this.set('scorecard', scorecard);

        // when
        const screen = await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.dom(screen.queryByRole('link', { name: 'Reprendre' })).doesNotExist();
        assert.dom(screen.queryByRole('link', { name: 'Commencer' })).doesNotExist();
      });

      test('should show the improving button if the remaining days before improving are equal to 0', async function (assert) {
        // given
        scorecard.isImprovable = true;
        scorecard.remainingDaysBeforeImproving = 0;
        scorecard.pixScoreAheadOfNextLevel = 8;

        // when
        this.set('scorecard', scorecard);
        const screen = await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.ok(screen.getByRole('button', this.intl.t('pages.competence-details.actions.improve.label')));
      });

      test('should show the improving countdown if the remaining days before improving are different than 0', async function (assert) {
        // given
        scorecard.remainingDaysBeforeImproving = 3;
        scorecard.pixScoreAheadOfNextLevel = 3;

        // when
        this.set('scorecard', scorecard);
        const screen = await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.ok(screen.getByText('Tenter le niveau supérieur dans'));
        assert.ok(screen.getByText('3 jours.'));
      });

      module('and the user has reached the max level', function (hooks) {
        hooks.beforeEach(function () {
          // given
          const store = this.owner.lookup('service:store');
          const scorecard = store.createRecord('scorecard', {
            pixScoreAheadOfNextLevel: 7,
            level: 5,
            isFinished: true,
            isFinishedWithMaxLevel: true,
            tutorials: [],
          });

          this.set('scorecard', scorecard);
        });

        test('should not display remainingPixToNextLevel', async function (assert) {
          // when
          await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

          // then
          assert.dom('.scorecard-details-content-right__level-info').doesNotExist();
        });

        test('should show congrats design', async function (assert) {
          // when
          await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

          // then
          assert.dom('.competence-card__congrats').exists();
        });

        test('should not show the improving button', async function (assert) {
          // when
          const screen = await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

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

        this.set('scorecard', scorecard);

        // when
        await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

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

        this.set('scorecard', scorecard);

        // when
        const screen = await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.ok(
          screen.getByRole('link', {
            name: `${this.intl.t('pages.competence-details.actions.start.label')} ${this.intl.t(
              'pages.competence-details.for-competence',
              { competence: scorecard.name }
            )}`,
          })
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

        this.set('scorecard', scorecard);

        // when
        const screen = await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.ok(
          screen.getByRole('link', {
            name: `${this.intl.t('pages.competence-details.actions.continue.label')} ${this.intl.t(
              'pages.competence-details.for-competence',
              { competence: scorecard.name }
            )}`,
          })
        );
      });

      test('should not display the tutorial section when there is no tutorial to show', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const scorecard = store.createRecord('scorecard', {
          competenceId: 1,
          isStarted: true,
        });

        this.set('scorecard', scorecard);

        // when
        const screen = await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.dom(screen.queryByRole('heading', { name: 'Cultivez vos compétences', level: 2 })).doesNotExist();
      });

      module('and the user has some tutorials', function () {
        test('should display the tutorial section and the related tutorials', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const tuto1 = store.createRecord('tutorial', {
            title: 'Tuto 1.1',
            tubeName: '@first_tube',
            tubePracticalTitle: 'Practical Title',
            duration: '00:15:10',
          });
          const tuto2 = store.createRecord('tutorial', {
            title: 'Tuto 2.1',
            tubeName: '@second_tube',
            tubePracticalTitle: 'Practical Title 1',
            duration: '00:04:00',
          });
          const tuto3 = store.createRecord('tutorial', {
            title: 'Tuto 2.2',
            tubeName: '@second_tube',
            tubePracticalTitle: 'Practical Title',
            duration: '00:04:00',
          });

          const tutorials = A([tuto1, tuto2, tuto3]);

          const scorecard = store.createRecord('scorecard', {
            competenceId: 1,
            isStarted: true,
            tutorials,
          });

          this.set('scorecard', scorecard);

          // when
          const screen = await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

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
