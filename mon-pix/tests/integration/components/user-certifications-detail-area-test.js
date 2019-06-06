import EmberObject from '@ember/object';
import { A as EmberArray } from '@ember/array';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | user certifications detail area', function() {
  setupRenderingTest();

  let area;

  beforeEach(function() {
    area = EmberObject.create({
      code: 3,
      id: 'recs7Gpf90ln8NCv7',
      name: '3. Création de contenu',
      title: 'Création de contenu',
      resultCompetences: EmberArray([
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

  it('renders', async function() {
    await render(hbs`{{user-certifications-detail-area area=area}}`);
    expect(find('.user-certifications-detail-area')).to.exist;
  });

  context('when has a list of competences', function() {

    beforeEach(async function() {
      // when
      await render(hbs`{{user-certifications-detail-area area=area}}`);
    });

    // then
    it('should show the title of area', function() {
      // given
      const divOfName = '.user-certifications-detail-area__box-name';

      // then
      expect(find(divOfName).textContent).to.include(area.get('title'));
    });

    it('should include one competences detail per competence', function() {
      // given
      const divOfCompetence = '.user-certifications-detail-competence';

      // then
      expect(findAll(divOfCompetence)).to.have.lengthOf(area.get('resultCompetences.length'));
    });
  });
});
