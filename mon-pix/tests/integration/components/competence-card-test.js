import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | competence-card', function() {
  setupRenderingTest();

  describe('Component rendering', function() {

    let area;

    beforeEach(function() {
      area = EmberObject.create({ code: 1 });
    });

    it('should render component', async function() {
      // given
      const scorecard = { area };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{competence-card scorecard=scorecard}}`);

      // then
      expect(this.element.querySelector('.competence-card')).to.exist;
    });

    [
      { code: 1, expectedColor: 'jaffa' },
      { code: 2, expectedColor: 'emerald' },
      { code: 3, expectedColor: 'cerulean' },
      { code: 4, expectedColor: 'wild-strawberry' },
      { code: 5, expectedColor: 'butterfly-bush' }
    ].forEach((data) => {

      it(`should display the competence card header in ${data.expectedColor} when code is ${data.code}`, async function() {
        // given
        const scorecard = { area: EmberObject.create({ code: data.code }) };
        this.set('scorecard', scorecard);

        // when
        await render(hbs`{{competence-card scorecard=scorecard}}`);

        // then
        expect(this.element.querySelector('.competence-card__color').getAttribute('class')).to.contains(`competence-card__color--${data.expectedColor}`);
      });
    });

    it('should display the area name', async function() {
      // given
      const scorecard = { area: EmberObject.create({ code: 1, title: 'First Area' }) };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{competence-card scorecard=scorecard}}`);

      // then
      expect(this.element.querySelector('.competence-card__area-name').textContent).to.equal(scorecard.area.title);
    });

    it('should display the competence name', async function() {
      // given
      const scorecard = { area, name: 'First Competence' };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{competence-card scorecard=scorecard}}`);

      // then
      expect(this.element.querySelector('.competence-card__competence-name').textContent).to.equal(scorecard.name);
    });

    it('should display the level', async function() {
      // given
      const scorecard = { area, level: 3 };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`{{competence-card scorecard=scorecard}}`);

      // then
      expect(this.element.querySelector('.competence-card-level__label').textContent).to.equal('Niveau');
      expect(this.element.querySelector('.competence-card-level__value').textContent).to.equal(scorecard.level.toString());
    });
  });
});
