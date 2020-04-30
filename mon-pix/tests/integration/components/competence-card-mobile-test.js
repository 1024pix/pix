import { expect } from 'chai';
import { describe, it } from 'mocha';
import  EmberObject  from '@ember/object';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | competence-card-mobile', function() {
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
      await render(hbs`{{competence-card-mobile scorecard=scorecard}}`);

      // then
      expect(find('.competence-card')).to.exist;
    });

    it('should display the competence card header with scorecard color', async function() {
      // given
      const scorecard = { area };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{competence-card-mobile scorecard=scorecard}}`);

      // then
      expect(find('.competence-card__color').getAttribute('class'))
        .to.contains('competence-card__color--jaffa');
    });

    it('should display the area name', async function() {
      // given
      const scorecard = { area: EmberObject.create({ code: 1, title: 'First Area' }) };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{competence-card-mobile scorecard=scorecard}}`);

      // then
      expect(find('.competence-card__area-name').textContent).to.equal(scorecard.area.title);
    });

    it('should display the competence name', async function() {
      // given
      const scorecard = { area, name: 'First Competence' };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{competence-card-mobile scorecard=scorecard}}`);

      // then
      expect(find('.competence-card__competence-name').textContent).to.equal(scorecard.name);
    });

    it('should display the level', async function() {
      // given
      const scorecard = { area, level: 3 };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{competence-card-mobile scorecard=scorecard}}`);

      // then
      expect(find('.score-value').textContent).to.equal(scorecard.level.toString());
    });

    context('when user can continue the competence', async function() {

      context('and the user has reached the maximum level', function() {
        beforeEach(async function() {
          // given
          const scorecard = { area, isFinishedWithMaxLevel: false, isStarted: true };
          this.set('scorecard', scorecard);

          // when
          await render(hbs`{{competence-card-mobile scorecard=scorecard}}`);
        });

        it('should not show congrats design', function() {
          // then
          expect(find('.competence-card__congrats')).to.not.exist;
        });

      });
    });

    context('when user has finished the competence', async function() {

      context('and the user has reached the maximum level', function() {
        beforeEach(async function() {
          // given
          const scorecard = { area, isFinishedWithMaxLevel: true };
          this.set('scorecard', scorecard);

          // when
          await render(hbs`{{competence-card-mobile scorecard=scorecard}}`);
        });

        it('should show congrats design', function() {
          // then
          expect(find('.competence-card__congrats')).to.exist;
        });

      });
    });
  });
});
