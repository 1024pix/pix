import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | user-certifications-detail-competences-list', function() {
  setupRenderingTest();

  let resultCompetenceTree;
  const PARENT_SELECTOR = '.user-certifications-detail-competences-list';
  const CONTENT_SELECTOR = '.user-certifications-detail-competence';

  beforeEach(async function() {
    // given
    resultCompetenceTree = EmberObject.create({
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
    this.set('resultCompetenceTree', resultCompetenceTree);

    // when
    await render(hbs`<UserCertificationsDetailCompetencesList @resultCompetenceTree={{this.resultCompetenceTree}} />`);
  });

  it('renders', async function() {
    // then
    expect(find(PARENT_SELECTOR)).to.exist;
  });

  it('should have "Compétences certifiées (niveaux sur 5)" as a title', async function() {
    // then
    expect(find(`${PARENT_SELECTOR} h2`).textContent).to.equal('Compétences certifiées (niveaux sur 5)');
  });

  context('when area has a list of competences', function() {
    it('should include one area detail per area', function() {
      // then
      expect(findAll(CONTENT_SELECTOR)).to.have.lengthOf(resultCompetenceTree.areas.length);
    });
  });
});
