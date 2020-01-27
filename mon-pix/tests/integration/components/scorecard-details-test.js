import { expect } from 'chai';
import { describe, it } from 'mocha';
import { A } from '@ember/array';
import { setupRenderingTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | scorecard-details', function() {
  setupRenderingTest();

  describe('Component rendering', function() {

    it('should render component', async function() {
      // given
      const scorecard = {};

      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{scorecard-details scorecard=scorecard}}`);

      // then
      expect(this.element.querySelector('.scorecard-details__content')).to.exist;
    });

    it('should display the scorecard header with area color', async function() {
      // given
      const scorecard = {
        area: {
          title: 'Area title',
          color: 'jaffa',
        },
      };

      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{scorecard-details scorecard=scorecard}}`);

      // then
      const element = this.element.querySelector('.scorecard-details-content-left__area');
      expect(element.getAttribute('class')).to.contains('scorecard-details-content-left__area--jaffa');
      expect(element.textContent).to.contains(scorecard.area.title);
    });

    it('should display the competence informations', async function() {
      // given
      const scorecard = {
        name: 'Scorecard name',
        description: 'Scorecard description',
      };

      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{scorecard-details scorecard=scorecard}}`);

      // then
      expect(this.element.querySelector('.scorecard-details-content-left__name').textContent).to.contain(scorecard.name);
      expect(this.element.querySelector('.scorecard-details-content-left__description').textContent).to.contain(scorecard.description);
    });

    it('should display the scorecard level, earnedPix and remainingPixToNextLevel', async function() {
      // given
      const scorecard = {
        level: 2,
        earnedPix: 22,
        remainingPixToNextLevel: 2,
      };

      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{scorecard-details scorecard=scorecard}}`);

      // then
      expect(this.element.querySelector('.score-value').textContent).to.contain(scorecard.level);
      expect(this.element.getElementsByClassName('score-value')[1].textContent).to.contain(scorecard.earnedPix);
      expect(this.element.querySelector('.scorecard-details-content-right__level-info').textContent).to.contain(`${scorecard.remainingPixToNextLevel} pix avant le niveau ${scorecard.level + 1}`);
    });

    it('should display a dash instead of the scorecard level and earnedPix if they are set to zero', async function() {
      // given
      const scorecard = {
        level: 0,
        earnedPix: 0,
      };

      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{scorecard-details scorecard=scorecard}}`);

      // then
      expect(this.element.querySelector('.score-value').textContent).to.contain('–');
      expect(this.element.querySelector('.score-value').textContent).to.contain('–');
    });

    context('When the user has finished a competence', async function() {
      beforeEach(async function() {
        // given
        const scorecard = {
          remainingPixToNextLevel: 1,
          isFinished: true,
        };

        this.set('scorecard', scorecard);

        // when
        await render(hbs`{{scorecard-details scorecard=scorecard}}`);
      });

      it('should not display remainingPixToNextLevel', async function() {
        // then
        expect(this.element.querySelector('.scorecard-details-content-right__level-info')).to.not.exist;
      });

      it('should not display a button', async function() {
        // then
        expect(this.element.querySelector('.scorecard-details__resume-or-start-button')).to.not.exist;
      });

      context('and the user has reached the max level', async function() {
        beforeEach(async function() {
          // given
          const scorecard = {
            remainingPixToNextLevel: 1,
            isFinishedWithMaxLevel: true,
            isFinished: true,
          };

          this.set('scorecard', scorecard);

          // when
          await render(hbs`{{scorecard-details scorecard=scorecard}}`);
        });

        it('should not display remainingPixToNextLevel', function() {
          // then
          expect(this.element.querySelector('.scorecard-details-content-right__level-info')).to.not.exist;
        });

        it('should show congrats design', function() {
          // then
          expect(find('.competence-card__congrats')).to.exist;
        });
      });
    });

    context('When the user did not started a competence', function() {
      it('should not display the level and remainingPixToNextLevel if scorecard.isNotStarted is true', async function() {
        // given
        const scorecard = {
          remainingPixToNextLevel: 1,
          isNotStarted: true,
        };

        this.set('scorecard', scorecard);

        // when
        await render(hbs`{{scorecard-details scorecard=scorecard}}`);

        // then
        expect(this.element.querySelector('.scorecard-details-content-right__score-container')).to.not.exist;
        expect(this.element.querySelector('.scorecard-details-content-right__level-info')).to.not.exist;
      });

      it('should display a button stating "Commencer" if scorecard.isStarted is false', async function() {
        // given
        const scorecard = {
          competenceId: 1,
          isStarted: false,
        };

        this.set('scorecard', scorecard);

        // when
        await render(hbs`{{scorecard-details scorecard=scorecard}}`);

        // then
        const element = this.element.querySelector('.scorecard-details__resume-or-start-button');
        expect(element).to.exist;
        expect(element.textContent).to.contain('Commencer');
      });
    });

    context('When the user has started a competence', async function() {

      it('should display a button stating "Reprendre"', async function() {
        // given
        const scorecard = {
          competenceId: 1,
          isStarted: true,
        };

        this.set('scorecard', scorecard);

        // when
        await render(hbs`{{scorecard-details scorecard=scorecard}}`);

        // then
        const element = this.element.querySelector('.scorecard-details__resume-or-start-button');
        expect(element).to.exist;
        expect(element.textContent).to.contain('Reprendre');
      });

      it('should not display the tutorial section when there is no tutorial to show', async function() {
        // given
        const scorecard = {
          competenceId: 1,
          isStarted: true,
        };

        this.set('scorecard', scorecard);

        // when
        await render(hbs`{{scorecard-details scorecard=scorecard}}`);

        // then
        expect(find('.tutorials')).to.not.exist;
      });

      context('and the user has some tutorials', async function() {
        it('should display the tutorial section and the related tutorials', async function() {
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
          await render(hbs`{{scorecard-details scorecard=scorecard}}`);

          // then
          expect(find('.tutorials')).to.exist;
          expect(findAll('.tube')).to.have.lengthOf(2);
          expect(findAll('.tutorial')).to.have.lengthOf(3);
        });

        it('should display the 4th tutorial of a tube on a new line', async function() {
          // given
          const tuto1 = EmberObject.create({
            title: 'Tuto 1.1',
            tubeName: '@first_tube',
            tubePracticalTitle: 'Practical Title',
            duration: '00:15:10',
          });
          const tuto2 = EmberObject.create({
            title: 'Tuto 1.2',
            tubeName: '@first_tube',
            tubePracticalTitle: 'Practical Title',
            duration: '00:04:00',
          });
          const tuto3 = EmberObject.create({
            title: 'Tuto 1.3',
            tubeName: '@first_tube',
            tubePracticalTitle: 'Practical Title',
            duration: '00:04:00',
          });
          const tuto4 = EmberObject.create({
            title: 'Tuto 1.4',
            tubeName: '@first_tube',
            tubePracticalTitle: 'Practical Title',
            duration: '00:04:00',
          });

          const tutorials = A([tuto1, tuto2, tuto3, tuto4]);

          const scorecard = EmberObject.create({
            competenceId: 1,
            isStarted: true,
            tutorials,
          });

          this.set('scorecard', scorecard);

          // when
          await render(hbs`{{scorecard-details scorecard=scorecard}}`);

          // then
          expect(find('.tutorials')).to.exist;
          expect(findAll('.tube')).to.have.lengthOf(1);
          expect(findAll('.tutorial')).to.have.lengthOf(4);
        });
      });
    });
  });
});
