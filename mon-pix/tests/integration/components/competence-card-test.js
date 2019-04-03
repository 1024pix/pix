import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | competence-card', function() {
  setupRenderingTest();

  describe('Component rendering', function() {

    it('should render component', async function() {
      // when
      await render(hbs`{{competence-card index=1}}`);

      // then
      expect(this.element.querySelector('.competence-card')).to.exist;
    });

    [
      { index: 1, expectedColor: 'jaffa' },
      { index: 2, expectedColor: 'emerald' },
      { index: 3, expectedColor: 'cerulean' },
      { index: 4, expectedColor: 'wild-strawberry' },
      { index: 5, expectedColor: 'butterfly-bush' }
    ].forEach((data) => {

      it(`should display the competence card header in ${data.expectedColor} when index is ${data.index}`, async function() {
        // given
        const index = data.index;
        this.set('index', index);

        // when
        await render(hbs`{{competence-card index=index}}`);

        // then
        expect(this.element.querySelector('.competence-card__color').getAttribute('class')).to.contain(`competence-card__color--${data.expectedColor}`);
      });
    });

    it('should display the area name', async function() {
      // given
      const area = 'First Area';
      this.set('area', area);

      // when
      await render(hbs`{{competence-card index=1 area=area}}`);

      // then
      expect(this.element.querySelector('.competence-card__area-name').textContent).to.equal(area);
    });

    it('should display the competence name', async function() {
      // given
      const competence = 'First Competence';
      this.set('competence', competence);

      // when
      await render(hbs`{{competence-card index=1 competence=competence}}`);

      // then
      expect(this.element.querySelector('.competence-card__competence-name').textContent).to.equal(competence);
    });

    it('should display the level', async function() {
      // given
      const level = '3';
      this.set('level', 3);

      // when
      await render(hbs`{{competence-card index=1 level=level}}`);

      // then
      expect(this.element.querySelector('.competence-card-level__label').textContent).to.equal('Niveau');
      expect(this.element.querySelector('.competence-card-level__value').textContent).to.equal(level);
    });
  });
});
