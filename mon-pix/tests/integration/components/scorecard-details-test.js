import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
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
        areaColor: 'jaffa',
        area: {
          title: 'Area title',
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
        earnedPixBlocked: 22,
        remainingPixToNextLevel: 2,
      };

      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{scorecard-details scorecard=scorecard}}`);

      // then
      expect(this.element.querySelector('.score-value').textContent).to.contain(scorecard.level);
      expect(this.element.getElementsByClassName('score-value')[1].textContent).to.contain(scorecard.earnedPixBlocked);
      expect(this.element.querySelector('.scorecard-details-content-right__level-info').textContent).to.contain(`${scorecard.remainingPixToNextLevel} pix avant le niveau ${scorecard.level + 1}`);
    });

    it('should not display remainingPixToNextLevel if scorecard.isMaxLevel is true', async function() {
      // given
      const scorecard = {
        remainingPixToNextLevel: 1,
        isMaxLevel: true,
      };

      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{scorecard-details scorecard=scorecard}}`);

      // then
      expect(this.element.querySelector('.scorecard-details-content-right__level-info')).to.not.exist;
    });

    it('should not display remainingPixToNextLevel if scorecard.isFinished is true', async function() {
      // given
      const scorecard = {
        remainingPixToNextLevel: 1,
        isFinished: true,
      };

      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{scorecard-details scorecard=scorecard}}`);

      // then
      expect(this.element.querySelector('.scorecard-details-content-right__level-info')).to.not.exist;
    });

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

    it('should not display a button if scorecard.isFinished', async function() {
      // given
      const scorecard = {
        isFinished: true,
      };

      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{scorecard-details scorecard=scorecard}}`);

      // then
      expect(this.element.querySelector('.scorecard-details__resume-or-start-button')).to.not.exist;
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

    it('should display a button stating "Reprendre" if scorecard.isStarted is true', async function() {
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

  });
});
