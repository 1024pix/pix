import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | competence-card-default', function() {
  setupIntlRenderingTest();

  describe('Component rendering', function() {

    let area;

    beforeEach(function() {
      area = EmberObject.create({
        code: 1,
        color: 'jaffa',
      });
    });

    it('should render component', async function() {
      // given
      const scorecard = { area };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`<CompetenceCardDefault @scorecard={{this.scorecard}} />`);

      // then
      expect(find('.competence-card')).to.exist;
    });

    it('should display the competence card header with scorecard color', async function() {
      // given
      const scorecard = { area };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`<CompetenceCardDefault @scorecard={{this.scorecard}} />`);

      // then
      expect(find('.competence-card__wrapper').getAttribute('class'))
        .to.contains('competence-card__wrapper--jaffa');
    });

    it('should display the area name', async function() {
      // given
      const scorecard = { area: EmberObject.create({ code: 1, title: 'First Area' }) };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`<CompetenceCardDefault @scorecard={{this.scorecard}} />`);

      // then
      expect(find('.competence-card__area-name').textContent).to.equal(scorecard.area.title);
    });

    it('should display the competence name', async function() {
      // given
      const scorecard = { area, name: 'First Competence' };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`<CompetenceCardDefault @scorecard={{this.scorecard}} />`);

      // then
      expect(find('.competence-card__competence-name').textContent).to.equal(scorecard.name);
    });

    it('should display the level', async function() {
      // given
      const scorecard = { area, level: 3 };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`<CompetenceCardDefault @scorecard={{this.scorecard}} />`);

      // then
      expect(find('.score-label').textContent).to.equal('niveau');
      expect(find('.score-value').textContent).to.equal(scorecard.level.toString());
    });

    context('when user can start the competence', async function() {

      it('should show the button "Commencer"', async function() {
        // given
        const scorecard = { area, level: 3, isFinished: false, isStarted: false };
        this.set('scorecard', scorecard);

        // when
        await render(hbs`<CompetenceCardDefault @scorecard={{this.scorecard}} />`);

        // then
        expect(find('.competence-card__button').textContent).to.contains('Commencer');
      });

    });

    context('when user can continue the competence', async function() {
      it('should show the button "Reprendre"', async function() {
        // given
        const scorecard = { area, level: 3, isFinished: false, isStarted: true };
        this.set('scorecard', scorecard);

        // when
        await render(hbs`<CompetenceCardDefault @scorecard={{this.scorecard}} />`);

        // then
        expect(find('.competence-card__button').textContent).to.contains('Reprendre');
      });

      context('and the user has reached the maximum level', function() {
        beforeEach(async function() {
          // given
          const scorecard = { area, isFinishedWithMaxLevel: false, isStarted: true };
          this.set('scorecard', scorecard);

          // when
          await render(hbs`<CompetenceCardDefault @scorecard={{this.scorecard}} />`);
        });

        it('should not show congrats design', function() {
          // then
          expect(find('.competence-card__congrats')).to.not.exist;
        });

        it('should not show congrats message in the footer', function() {
          // then
          expect(find('.competence-card-footer__congrats-message')).to.not.exist;
        });
      });
    });

    context('when user has finished the competence', async function() {
      it('should show the improving button when there is no remaining days before improving', async function() {
        // given
        const scorecard = { area, level: 3, isFinished: true, isStarted: false, remainingDaysBeforeImproving: 0 };
        this.set('scorecard', scorecard);

        // when
        await render(hbs`<CompetenceCardDefault @scorecard={{this.scorecard}} />`);

        // then
        expect(find('.competence-card__button')).to.exist;
        expect(find('.competence-card__button').textContent).to.contains('Retenter');
      });

      it('should show the improving countdown when there is some remaining days before improving', async function() {
        // given
        const scorecard = { area, level: 3, isFinished: true, isStarted: false, remainingDaysBeforeImproving: 3 };
        this.set('scorecard', scorecard);

        // when
        await render(hbs`<CompetenceCardDefault @scorecard={{this.scorecard}} />`);

        // then
        expect(find('.competence-card-interactions__improvement-countdown')).to.exist;
        expect(find('.competence-card-interactions__improvement-countdown').textContent).to.contains('3 jours');
      });

      context('and the user has reached the maximum level', function() {
        beforeEach(async function() {
          // given
          const scorecard = { area, isFinishedWithMaxLevel: true };
          this.set('scorecard', scorecard);

          // when
          await render(hbs`<CompetenceCardDefault @scorecard={{this.scorecard}} />`);
        });

        it('should show congrats design', function() {
          // then
          expect(find('.competence-card__congrats')).to.exist;
        });

        it('should show congrats message in the footer', function() {
          // then
          expect(find('.competence-card__congrats-message')).to.exist;
        });
      });
    });
  });
});
