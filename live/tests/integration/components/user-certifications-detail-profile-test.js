import EmberObject from '@ember/object';
import { A } from '@ember/array';

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | user certifications detail profile', function() {
  setupComponentTest('user-certifications-detail-profile', {
    integration: true,
  });

  const resultCompetenceTree = EmberObject.create({
    areas: A([
      EmberObject.create({
        code: 3,
        id: 'recs7Gpf90ln8NCv7',
        name: '3. Création de contenu',
        title: 'Création de contenu',
        competences: A([]),
      }),
      EmberObject.create({
        code: 1,
        id: 'recvoGdo7z2z7pXWa',
        name: '1. Information et données',
        title: 'Information et données',
        competences: A([]),
      }),
      EmberObject.create({
        code: 2,
        id: 'recoB4JYOBS1PCxhh',
        name: '2. Communication et collaboration',
        title: 'Communication et collaboration',
        competences: A([]),
      }),
    ]),
  });

  it('renders', function() {
    this.set('resultCompetenceTree', resultCompetenceTree);

    this.render(hbs`{{user-certifications-detail-profile  resultCompetenceTree=resultCompetenceTree}}`);
    expect(this.$()).to.have.length(1);
  });

  context('when are has a list of competences', function() {

    beforeEach(function() {
      // given
      this.set('resultCompetenceTree', resultCompetenceTree);

      // when
      this.render(hbs`{{user-certifications-detail-profile resultCompetenceTree=resultCompetenceTree}}`);
    });

    it('should include one area detail per area', function() {
      // given
      const divOfArea = '.user-certifications-detail-area';

      // then
      expect(this.$(divOfArea)).to.have.lengthOf(resultCompetenceTree.areas.length);
    });
  });
});
