import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | user certifications detail competence', function() {
  setupRenderingTest();

  let competence;

  beforeEach(function() {
    competence = EmberObject.create({
      'index': 1.2,
      'level': -1,
      'name': 'Mener une recherche et une veille d’information',
      'score': 0,
    });
  });

  it('renders', async function() {
    this.set('competence', competence);

    await render(hbs`{{user-certifications-detail-competence competence=competence}}`);
    expect(find('.user-certifications-detail-competence')).to.exist;
  });

  context('when competence has level -1', function() {

    beforeEach(async function() {
      // given
      this.set('competence', competence);

      // when
      await render(hbs`{{user-certifications-detail-competence competence=competence}}`);
    });

    // then
    it('should show the name of competence', function() {
      // given
      const divOfName = '.user-certifications-detail-competence__box-name';

      // then
      expect(find(divOfName).textContent).to.include(competence.name);
    });

    it('should not show the level of competence', function() {
      // given
      const divOfLevel = '.user-certifications-detail-competence__box-level';

      // then
      expect(find(divOfLevel)).to.not.exist;
    });

    it('should show all level bar in grey', function() {
      // given
      const divOfBarUnvalidatedLevel = '.user-certifications-detail-competence__not-validate-level';

      // then
      expect(findAll(divOfBarUnvalidatedLevel)).to.have.lengthOf(8);
    });
  });

  context('when competence has level 0', function() {

    beforeEach(async function() {
      // given
      competence = EmberObject.create({
        'index': 1.2,
        'level': 0,
        'name': 'Mener une recherche et une veille d’information',
        'score': 0,
      });
      this.set('competence', competence);

      // when
      await render(hbs`{{user-certifications-detail-competence competence=competence}}`);
    });

    // then
    it('should show the name of competence', function() {
      // given
      const divOfName = '.user-certifications-detail-competence__box-name';

      // then
      expect(find(divOfName).textContent).to.include(competence.name);
    });

    it('should not show the level of competence', function() {
      // given
      const divOfLevel = '.user-certifications-detail-competence__box-level';

      // then
      expect(find(divOfLevel)).to.not.exist;
    });

    it('should show all level bar in grey', function() {
      // given
      const divOfBarUnvalidatedLevel = '.user-certifications-detail-competence__not-validate-level';

      // then
      expect(findAll(divOfBarUnvalidatedLevel)).to.have.lengthOf(8);
    });
  });

  context('when competence has level 5', function() {

    beforeEach(async function() {
      // given
      competence = EmberObject.create({
        'index': 1.2,
        'level': 5,
        'name': 'Mener une recherche et une veille d’information',
        'score': 41,
      });
      this.set('competence', competence);

      // when
      await render(hbs`{{user-certifications-detail-competence competence=competence}}`);
    });

    // then
    it('should show the name of competence', function() {
      // given
      const divOfName = '.user-certifications-detail-competence__box-name';

      // then
      expect(find(divOfName).textContent).to.include(competence.name);
    });

    it('should show the level of competence', function() {
      // given
      const divOfLevel = '.user-certifications-detail-competence__box-level';

      // then
      expect(find(divOfLevel)).to.exist;
      expect(find(divOfLevel).textContent).to.include(competence.level);

    });

    it('should show 5 level bar in yellow and 3 in grey', function() {
      // given
      const divOfBarValidatedLevel = '.user-certifications-detail-competence__validate-level';
      const divOfBarUnvalidatedLevel = '.user-certifications-detail-competence__not-validate-level';

      // then
      expect(findAll(divOfBarValidatedLevel)).to.have.lengthOf(5);
      expect(findAll(divOfBarUnvalidatedLevel)).to.have.lengthOf(3);
    });
  });
});
