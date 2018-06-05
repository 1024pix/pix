import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | user certifications detail area', function() {
  setupComponentTest('user-certifications-detail-area', {
    integration: true,
  });

  let area;

  it('renders', function() {
    this.render(hbs`{{user-certifications-detail-area area=area}}`);
    expect(this.$()).to.have.length(1);
  });

  context('when has a list of competences', function() {

    beforeEach(function() {
      // given
      area = {
        'area-name': 'Information et données',
        'area-index': '1',
        'competences': [
          {
            'competenceName': 'Mener une recherche et une veille d’information',
            'competenceIndex': '1.1',
            'level': 5
          },
          {
            'competenceName': 'Gérer des données',
            'competenceIndex': '1.2',
            'level': -1
          },
          {
            'competenceName': 'Traiter des données',
            'competenceIndex': '1.3',
            'level': 3
          }
        ]
      };
      this.set('area', area);

      // when
      this.render(hbs`{{user-certifications-detail-area area=area}}`);
    });

    // then
    it('should show the name of area', function() {
      // given
      const divOfName = '.user-certifications-detail-area__box-name';

      // then
      expect(this.$(divOfName).text()).to.include(area['area-name']);
    });

    it('should include one competences detail per competence', function() {
      // given
      const divOfCompetence = '.user-certifications-detail-competence';

      // then
      expect(this.$(divOfCompetence)).to.have.lengthOf(area.competences.length);
    });
  });

});
