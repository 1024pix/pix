import { expect } from 'chai';
import { describe, it } from 'mocha';
import  EmberObject  from '@ember/object';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | competence-card-desktop', function() {
  setupRenderingTest();

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
      await render(hbs`{{competence-card-desktop scorecard=scorecard}}`);

      // then
      expect(find('.competence-card')).to.exist;
    });

    it('should display the competence card header with scorecard color', async function() {
      // given
      const scorecard = { area };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{competence-card-desktop scorecard=scorecard}}`);

      // then
      expect(find('.competence-card__color').getAttribute('class'))
        .to.contains('competence-card__color--jaffa');
    });

    it('should display the area name', async function() {
      // given
      const scorecard = { area: EmberObject.create({ code: 1, title: 'First Area' }) };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{competence-card-desktop scorecard=scorecard}}`);

      // then
      expect(find('.competence-card__area-name').textContent).to.equal(scorecard.area.title);
    });

    it('should display the competence name', async function() {
      // given
      const scorecard = { area, name: 'First Competence' };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{competence-card-desktop scorecard=scorecard}}`);

      // then
      expect(find('.competence-card__competence-name').textContent).to.equal(scorecard.name);
    });

    it('should display the level', async function() {
      // given
      const scorecard = { area, level: 3 };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{competence-card-desktop scorecard=scorecard}}`);

      // then
      expect(find('.score-label').textContent).to.equal('Niveau');
      expect(find('.score-value').textContent).to.equal(scorecard.level.toString());
    });

    context('when user can start the competence', async function() {

      it('should show the button "Commencer"', async function() {
        // given
        const scorecard = { area, level: 3, isFinished: false, isStarted: false };
        this.set('scorecard', scorecard);

        // when
        await render(hbs`{{competence-card-desktop scorecard=scorecard}}`);

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
        await render(hbs`{{competence-card-desktop scorecard=scorecard}}`);

        // then
        expect(find('.competence-card__button').textContent).to.contains('Reprendre');
      });

      context('and the user has reached the maximum level', function() {
        beforeEach(async function() {
          // given
          const scorecard = { area, isFinishedWithMaxLevel: false, isStarted: true };
          this.set('scorecard', scorecard);

          // when
          await render(hbs`{{competence-card-desktop scorecard=scorecard}}`);
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

      it('should not show the button', async function() {
        // given
        const scorecard = { area, level: 3, isFinished: true, isStarted: false };
        this.set('scorecard', scorecard);

        // when
        await render(hbs`{{competence-card-desktop scorecard=scorecard}}`);

        // then
        expect(find('.competence-card__button')).to.be.null;
      });

      context('and the user has reached the maximum level', function() {
        beforeEach(async function() {
          // given
          const scorecard = { area, isFinishedWithMaxLevel: true };
          this.set('scorecard', scorecard);

          // when
          await render(hbs`{{competence-card-desktop scorecard=scorecard}}`);
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
