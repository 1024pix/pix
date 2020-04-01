import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | user certifications detail profile', function() {
  setupRenderingTest();

  const resultCompetenceTree = EmberObject.create({
    areas: A([
      EmberObject.create({
        code: 3,
        id: 'recs7Gpf90ln8NCv7',
        name: '3. Création de contenu',
        title: 'Création de contenu',
        resultCompetences: A([]),
      }),
      EmberObject.create({
        code: 1,
        id: 'recvoGdo7z2z7pXWa',
        name: '1. Information et données',
        title: 'Information et données',
        resultCompetences: A([]),
      }),
      EmberObject.create({
        code: 2,
        id: 'recoB4JYOBS1PCxhh',
        name: '2. Communication et collaboration',
        title: 'Communication et collaboration',
        resultCompetences: A([]),
      }),
    ]),
  });

  it('renders', async function() {
    this.set('resultCompetenceTree', resultCompetenceTree);

    await render(hbs`{{user-certifications-detail-profile resultCompetenceTree=resultCompetenceTree}}`);
    expect(find('.user-certifications-detail-profile')).to.exist;
  });

  context('when are has a list of competences', function() {

    beforeEach(async function() {
      // given
      this.set('resultCompetenceTree', resultCompetenceTree);

      // when
      await render(hbs`{{user-certifications-detail-profile resultCompetenceTree=resultCompetenceTree}}`);
    });

    it('should include one area detail per area', function() {
      // given
      const divOfArea = '.user-certifications-detail-area';

      // then
      expect(findAll(divOfArea)).to.have.lengthOf(resultCompetenceTree.areas.length);
    });
  });
});
