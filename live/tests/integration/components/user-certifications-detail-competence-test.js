import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | user certifications detail competence', function() {
  setupComponentTest('user-certifications-detail-competence', {
    integration: true,
  });

  let competence;

  it('renders', function() {
    this.render(hbs`{{user-certifications-detail-competence competence=competence}}`);
    expect(this.$()).to.have.length(1);
  });

  context('when competence has level -1', function() {

    beforeEach(function() {
      // given
      competence = {
        'competenceName': 'Mener une recherche et une veille d’information',
        'competenceIndex': '1.1',
        'level': -1
      };
      this.set('competence', competence);

      // when
      this.render(hbs`{{user-certifications-detail-competence competence=competence}}`);
    });

    // then
    it('should show the name of competence', function() {
      // given
      const divOfName = '.user-certifications-detail-competence__box-name';

      // then
      expect(this.$(divOfName).text()).to.include(competence.competenceName);
    });

    it('should not show the level of competence', function() {
      // given
      const divOfLevel = '.user-certifications-detail-competence__box-level';

      // then
      expect(this.$(divOfLevel)).to.have.lengthOf(0);
    });

    it('should show all level bar in grey', function() {
      // given
      const divOfBarUnvalidatedLevel = '.user-certifications-detail-competence__not-validate-level';

      // then
      expect(this.$(divOfBarUnvalidatedLevel)).to.have.lengthOf(8);
    });
  });

  context('when competence has level 0', function() {

    beforeEach(function() {
      // given
      competence = {
        'competenceName': 'Mener une recherche et une veille d’information',
        'competenceIndex': '1.1',
        'level': 0
      };
      this.set('competence', competence);

      // when
      this.render(hbs`{{user-certifications-detail-competence competence=competence}}`);
    });

    // then
    it('should show the name of competence', function() {
      // given
      const divOfName = '.user-certifications-detail-competence__box-name';

      // then
      expect(this.$(divOfName).text()).to.include(competence.competenceName);
    });

    it('should not show the level of competence', function() {
      // given
      const divOfLevel = '.user-certifications-detail-competence__box-level';

      // then
      expect(this.$(divOfLevel)).to.have.lengthOf(0);
    });

    it('should show all level bar in grey', function() {
      // given
      const divOfBarUnvalidatedLevel = '.user-certifications-detail-competence__not-validate-level';

      // then
      expect(this.$(divOfBarUnvalidatedLevel)).to.have.lengthOf(8);
    });
  });

  context('when competence has level 5', function() {

    beforeEach(function() {
      // given
      competence = {
        'competenceName': 'Mener une recherche et une veille d’information',
        'competenceIndex': '1.1',
        'level': 5
      };
      this.set('competence', competence);

      // when
      this.render(hbs`{{user-certifications-detail-competence competence=competence}}`);
    });

    // then
    it('should show the name of competence', function() {
      // given
      const divOfName = '.user-certifications-detail-competence__box-name';

      // then
      expect(this.$(divOfName).text()).to.include(competence.competenceName);
    });

    it('should show the level of competence', function() {
      // given
      const divOfLevel = '.user-certifications-detail-competence__box-level';

      // then
      expect(this.$(divOfLevel)).to.have.lengthOf(1);
      expect(this.$(divOfLevel).text()).to.include(competence.level);

    });

    it('should show 5 level bar in yellow and 3 in grey', function() {
      // given
      const divOfBarValidatedLevel = '.user-certifications-detail-competence__validate-level';
      const divOfBarUnvalidatedLevel = '.user-certifications-detail-competence__not-validate-level';

      // then
      expect(this.$(divOfBarValidatedLevel)).to.have.lengthOf(5);
      expect(this.$(divOfBarUnvalidatedLevel)).to.have.lengthOf(3);
    });
  });

});
