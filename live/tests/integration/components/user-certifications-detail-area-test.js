import EmberObject from '@ember/object';
import { A } from '@ember/array';

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | user certifications detail area', function() {
  setupComponentTest('user-certifications-detail-area', {
    integration: true,
  });

  let area;

  beforeEach(function() {
    area = EmberObject.create({
      code: 3,
      id: 'recs7Gpf90ln8NCv7',
      name: '3. Création de contenu',
      title: 'Création de contenu',
      competences: A([
        {
          'index': 1.1,
          'level': 5,
          'name': 'Mener une recherche et une veille d’information',
          'score': 41,
        },
        {
          'index': 1.2,
          'level': -1,
          'name': 'Gérer des données',
          'score': 0,
        },
        {
          'index': 1.3,
          'level': 3,
          'name': 'Traiter des données',
          'score': 20,
        },
      ]),
    });
    this.set('area', area);
  });

  it('renders', function() {
    this.render(hbs`{{user-certifications-detail-area area=area}}`);
    expect(this.$()).to.have.length(1);
  });

  context('when has a list of competences', function() {

    beforeEach(function() {
      // when
      this.render(hbs`{{user-certifications-detail-area area=area}}`);
    });

    // then
    it('should show the title of area', function() {
      // given
      const divOfName = '.user-certifications-detail-area__box-name';

      // then
      expect(this.$(divOfName).text()).to.include(area.get('title'));
    });

    it('should include one competences detail per competence', function() {
      // given
      const divOfCompetence = '.user-certifications-detail-competence';

      // then
      expect(this.$(divOfCompetence)).to.have.lengthOf(area.get('competences.length'));
    });
  });
});
