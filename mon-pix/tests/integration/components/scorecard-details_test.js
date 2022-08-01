import { module, test } from 'qunit';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | scorecard-details', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function () {
    test('should render component', async function (assert) {
      // given
      const scorecard = {};

      this.set('scorecard', scorecard);

      // when
      await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

      // then
      assert.dom(find('.scorecard-details__content')).exists();
    });

    test('should display the scorecard header with area color', async function (assert) {
      // given
      const scorecard = {
        area: {
          title: 'Area title',
          color: 'jaffa',
        },
      };

      this.set('scorecard', scorecard);

      // when
      await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

      // then
      const element = find('.scorecard-details-content-left__area');
      assert.dom(element.getAttribute('class')).hasValue('scorecard-details-content-left__area--jaffa');
      assert.dom(element.textContent).hasText(scorecard.area.title);
    });

    test('should display the competence informations', async function (assert) {
      // given
      const scorecard = {
        name: 'Scorecard name',
        description: 'Scorecard description',
      };

      this.set('scorecard', scorecard);

      // when
      await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

      // then
      assert.dom(find('.scorecard-details-content-left__name').textContent).hasText(scorecard.name);
      assert.dom(find('.scorecard-details-content-left__description').textContent).hasText(scorecard.description);
    });

    test('should display the scorecard level, earnedPix and remainingPixToNextLevel', async function (assert) {
      // given
      const scorecard = {
        level: 2,
        earnedPix: 22,
        remainingPixToNextLevel: 2,
      };

      this.set('scorecard', scorecard);

      // when
      await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

      // then
      assert.dom(find('.score-value').textContent).hasText(scorecard.level);
      assert.dom(findAll('.score-value')[1].textContent).hasText(scorecard.earnedPix);
      assert
        .dom(find('.scorecard-details-content-right__level-info').textContent)
        .hasText(`${scorecard.remainingPixToNextLevel} pix avant le niveau ${scorecard.level + 1}`);
    });

    test('should display a dash instead of the scorecard level and earnedPix if they are set to zero', async function (assert) {
      // given
      const scorecard = {
        level: 0,
        earnedPix: 0,
      };

      this.set('scorecard', scorecard);

      // when
      await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

      // then
      assert.dom(find('.score-value').textContent).hasText('–');
      assert.dom(find('.score-value').textContent).hasText('–');
    });

    module('When the user has finished a competence', async function (hooks) {
      let scorecard;

      hooks.beforeEach(function () {
        // given
        scorecard = {
          remainingPixToNextLevel: 1,
          isFinished: true,
          tutorials: [],
        };
      });

      test('should not display remainingPixToNextLevel', async function (assert) {
        // when
        this.set('scorecard', scorecard);
        await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.dom(find('.scorecard-details-content-right__level-info')).doesNotExist();
      });

      test('should not display a button', async function (assert) {
        // when
        this.set('scorecard', scorecard);
        await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.dom(find('.scorecard-details__resume-or-start-button')).doesNotExist();
      });

      test('should show the improving button if the remaining days before improving are equal to 0', async function (assert) {
        // given
        scorecard.remainingDaysBeforeImproving = 0;

        // when
        this.set('scorecard', scorecard);
        await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.dom(find('.scorecard-details__improve-button')).exists();
      });

      test('should show the improving countdown if the remaining days before improving are different than 0', async function (assert) {
        // given
        scorecard.remainingDaysBeforeImproving = 3;

        // when
        this.set('scorecard', scorecard);
        await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.dom(find('.scorecard-details__improvement-countdown')).exists();
        assert.dom(find('.scorecard-details__improvement-countdown').textContent).hasText('3 jours');
      });

      module('and the user has reached the max level', async function () {
        hooks.beforeEach(async function () {
          // given
          const scorecard = {
            remainingPixToNextLevel: 1,
            isFinishedWithMaxLevel: true,
            isFinished: true,
            tutorials: [],
          };

          this.set('scorecard', scorecard);

          // when
          await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);
        });

        test('should not display remainingPixToNextLevel', function (assert) {
          // then
          assert.dom(find('.scorecard-details-content-right__level-info')).doesNotExist();
        });

        test('should show congrats design', function (assert) {
          // then
          assert.dom(find('.competence-card__congrats')).exists();
        });

        test('should not show the improving button', function (assert) {
          // then
          assert.dom(find('.scorecard-details__improve-button')).doesNotExist();
        });
      });
    });

    module('When the user did not started a competence', function () {
      test('should not display the level and remainingPixToNextLevel if scorecard.isNotStarted is true', async function (assert) {
        // given
        const scorecard = {
          remainingPixToNextLevel: 1,
          isNotStarted: true,
        };

        this.set('scorecard', scorecard);

        // when
        await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.dom(find('.scorecard-details-content-right__score-container')).doesNotExist();
        assert.dom(find('.scorecard-details-content-right__level-info')).doesNotExist();
      });

      test('should display a button stating "Commencer" if scorecard.isStarted is false', async function (assert) {
        // given
        const scorecard = {
          competenceId: 1,
          isStarted: false,
        };

        this.set('scorecard', scorecard);

        // when
        await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        const element = find('.scorecard-details__resume-or-start-button');
        assert.dom(element).exists();
        assert.dom(element.textContent).hasText('Commencer');
      });
    });

    module('When the user has started a competence', async function () {
      test('should display a button stating "Reprendre"', async function (assert) {
        // given
        const scorecard = {
          competenceId: 1,
          isStarted: true,
        };

        this.set('scorecard', scorecard);

        // when
        await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        const element = find('.scorecard-details__resume-or-start-button');
        assert.dom(element).exists();
        assert.dom(element.textContent).hasText('Reprendre');
      });

      test('should not display the tutorial section when there is no tutorial to show', async function (assert) {
        // given
        const scorecard = {
          competenceId: 1,
          isStarted: true,
        };

        this.set('scorecard', scorecard);

        // when
        await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

        // then
        assert.dom(find('.tutorials')).doesNotExist();
      });

      module('and the user has some tutorials', async function () {
        test('should display the tutorial section and the related tutorials', async function (assert) {
          // given
          const tuto1 = EmberObject.create({
            title: 'Tuto 1.1',
            tubeName: '@first_tube',
            tubePracticalTitle: 'Practical Title',
            duration: '00:15:10',
          });
          const tuto2 = EmberObject.create({
            title: 'Tuto 2.1',
            tubeName: '@second_tube',
            tubePracticalTitle: 'Practical Title',
            duration: '00:04:00',
          });
          const tuto3 = EmberObject.create({
            title: 'Tuto 2.2',
            tubeName: '@second_tube',
            tubePracticalTitle: 'Practical Title',
            duration: '00:04:00',
          });

          const tutorials = A([tuto1, tuto2, tuto3]);

          const scorecard = EmberObject.create({
            competenceId: 1,
            isStarted: true,
            tutorials,
          });

          this.set('scorecard', scorecard);

          // when
          await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

          // then
          assert.dom(find('.tutorials')).exists();
          assert.equal(findAll('.tube').length, 2);
          assert.equal(findAll('.tutorial-card-v2').length, 3);
        });

        module('when newTutorials FT is enabled', function () {
          test('should display the tutorial section and related tutorials', async function (assert) {
            // given
            const tuto1 = EmberObject.create({
              title: 'Tuto 1.1',
              tubeName: '@first_tube',
              tubePracticalTitle: 'Practical Title',
              duration: '00:15:10',
            });
            const tuto2 = EmberObject.create({
              title: 'Tuto 2.1',
              tubeName: '@second_tube',
              tubePracticalTitle: 'Practical Title',
              duration: '00:04:00',
            });
            const tuto3 = EmberObject.create({
              title: 'Tuto 2.2',
              tubeName: '@second_tube',
              tubePracticalTitle: 'Practical Title',
              duration: '00:04:00',
            });

            const tutorials = A([tuto1, tuto2, tuto3]);

            const scorecard = EmberObject.create({
              competenceId: 1,
              isStarted: true,
              tutorials,
            });

            this.set('scorecard', scorecard);

            // when
            await render(hbs`<ScorecardDetails @scorecard={{this.scorecard}} />`);

            // then
            assert.dom(find('.tutorials')).exists();
            assert.equal(findAll('.tube').length, 2);
            assert.equal(findAll('.tutorial-card-v2').length, 3);
          });
        });
      });
    });
  });
});
