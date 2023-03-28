import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | user-certifications-detail-competences-list', function (hooks) {
  setupIntlRenderingTest(hooks);

  let resultCompetenceTree;
  const PARENT_SELECTOR = '.user-certifications-detail-competences-list';
  const CONTENT_SELECTOR = '.user-certifications-detail-competence';

  hooks.beforeEach(async function () {
    // given
    this.maxReachableLevelOnCertificationDate = 5;
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
    await render(hbs`<UserCertificationsDetailCompetencesList
      @resultCompetenceTree={{this.resultCompetenceTree}}
      @maxReachableLevelOnCertificationDate={{this.maxReachableLevelOnCertificationDate}} />`);
  });

  test('renders', async function (assert) {
    // then
    assert.dom(PARENT_SELECTOR).exists();
  });

  test('should have "Compétences certifiées (niveaux sur 5)" as a title', async function (assert) {
    // then
    assert.strictEqual(find(`${PARENT_SELECTOR} h2`).innerText, 'Compétences certifiées (niveaux sur 5)');
  });

  module('when area has a list of competences', function () {
    test('should include one area detail per area', function (assert) {
      // then
      assert.dom(CONTENT_SELECTOR).exists({ count: resultCompetenceTree.areas.length });
    });
  });
});
