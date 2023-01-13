import { module, test } from 'qunit';
import { A } from '@ember/array';
import { find, findAll } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | scorecard-details', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function () {
    test('should render component', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const scorecard = store.createRecord('scorecard', {});

      this.set('scorecard', scorecard);

      // when
      await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

      // then
      assert.dom('.scorecard-details__content').exists();
    });

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
      await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

      // then
      const element = find('.scorecard-details-content-left__area');
      assert.ok(element.getAttribute('class').includes('scorecard-details-content-left__area--jaffa'));
      assert.ok(element.textContent.includes(scorecard.area.get('title')));
    });

    test('should display the competence informations', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const scorecard = store.createRecord('scorecard', {
        name: 'Scorecard name',
        description: 'Scorecard description',
      });

      this.set('scorecard', scorecard);

      // when
      await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

      // then
      assert.ok(find('.scorecard-details-content-left__name').textContent.includes(scorecard.name));
      assert.ok(find('.scorecard-details-content-left__description').textContent.includes(scorecard.description));
    });

    test('should display the scorecard level, earnedPix and remainingPixToNextLevel', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const scorecard = store.createRecord('scorecard', {
        level: 2,
        earnedPix: 22,
        pixScoreAheadOfNextLevel: 6,
        status: 'STARTED',
      });

      this.set('scorecard', scorecard);

      // when
      await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

      // then
      assert.ok(find('.score-value').textContent.includes(scorecard.level));
      assert.ok(findAll('.score-value')[1].textContent.includes(scorecard.earnedPix));
      assert.ok(
        find('.scorecard-details-content-right__level-info').textContent.includes(
          `${scorecard.remainingPixToNextLevel} pix avant le niveau ${scorecard.level + 1}`
        )
      );
    });

    test('should display a dash instead of the scorecard level and earnedPix if they are set to zero', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const scorecard = store.createRecord('scorecard', {
        level: 0,
        earnedPix: 0,
        status: 'COMPLETED',
      });

      this.set('scorecard', scorecard);

      // when
      await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

      // then
      assert.ok(find('.score-value').textContent.includes('–'));
      assert.ok(find('.score-value').textContent.includes('–'));
    });

    module('When the user has finished a competence', function (hooks) {
      let scorecard;

      hooks.beforeEach(function () {
        // given
        const store = this.owner.lookup('service:store');
        scorecard = store.createRecord('scorecard', {
          pixScoreAheadOfNextLevel: 7,
          level: 3,
          status: 'COMPLETED',
          tutorials: [],
        });
      });

      test('should not display remainingPixToNextLevel', async function (assert) {
        // when
        this.set('scorecard', scorecard);
        await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.dom('.scorecard-details-content-right__level-info').doesNotExist();
      });

      test('should not display a button', async function (assert) {
        // when
        this.set('scorecard', scorecard);
        await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.dom('.scorecard-details__resume-or-start-button').doesNotExist();
      });

      test('should show the improving button if the remaining days before improving are equal to 0', async function (assert) {
        // given
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
        await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.dom('.scorecard-details__improvement-countdown').exists();
        assert.ok(find('.scorecard-details__improvement-countdown').textContent.includes('3 jours'));
      });

      module('and the user has reached the max level', function (hooks) {
        hooks.beforeEach(async function () {
          // given
          const store = this.owner.lookup('service:store');
          const scorecard = store.createRecord('scorecard', {
            pixScoreAheadOfNextLevel: 7,
            level: 5,
            status: 'COMPLETED',
            tutorials: [],
          });

          this.set('scorecard', scorecard);

          // when
          await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);
        });

        test('should not display remainingPixToNextLevel', function (assert) {
          // then
          assert.dom('.scorecard-details-content-right__level-info').doesNotExist();
        });

        test('should show congrats design', function (assert) {
          // then
          assert.dom('.competence-card__congrats').exists();
        });

        test('should not show the improving button', function (assert) {
          // then
          assert.dom('.scorecard-details__improve-button').doesNotExist();
        });
      });
    });

    module('When the user did not started a competence', function () {
      test('should not display the level and remainingPixToNextLevel if scorecard.isNotStarted is true', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const scorecard = store.createRecord('scorecard', {
          pixScoreAheadOfNextLevel: 7,
          status: 'NOT_STARTED',
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
          status: 'NOT_STARTED',
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
          status: 'STARTED',
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
          status: 'STARTED',
        });

        this.set('scorecard', scorecard);

        // when
        await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.dom('.tutorials').doesNotExist();
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
            tubePracticalTitle: 'Practical Title',
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
            status: 'STARTED',
            tutorials,
          });

          this.set('scorecard', scorecard);

          // when
          await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

          // then
          assert.dom('.tutorials').exists();
          assert.dom('.tube').exists({ count: 2 });
          assert.dom('.tutorial-card').exists({ count: 3 });
        });
      });
    });
  });
});
