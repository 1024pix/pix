import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import { find, render } from '@ember/test-helpers';
import { A as EmberArray } from '@ember/array';

module('Integration | Component | user-certifications-detail-competence', function (hooks) {
  setupIntlRenderingTest(hooks);

  let area;
  const PARENT_SELECTOR = '.user-certifications-detail-competence';
  const TITLE_SELECTOR = `${PARENT_SELECTOR}__title`;
  const COMPETENCE_SELECTOR = `${PARENT_SELECTOR} div`;
  const DISABLED_CLASS = 'user-certifications-detail-competence__competence--disabled';

  hooks.beforeEach(async function () {
    area = EmberObject.create({
      code: 3,
      id: 'recs7Gpf90ln8NCv7',
      name: '3. Création de contenu',
      title: 'Création de contenu',
      resultCompetences: EmberArray([
        {
          index: 1.1,
          level: 5,
          name: 'Programmer',
          score: 41,
        },
        {
          index: 1.2,
          level: -1,
          name: 'Adapter les docs à leur finalité',
          score: 0,
        },
        {
          index: 1.3,
          level: 0,
          name: 'Développer des docs multimédia',
          score: 0,
        },
        {
          index: 1.4,
          level: 3,
          name: 'Développer des docs textuels',
          score: 20,
        },
      ]),
    });
    this.set('area', area);

    // when
    await render(hbs`<UserCertificationsDetailCompetence @area={{this.area}} />`);
  });

  test('renders', function (assert) {
    //then
    assert.dom(`${PARENT_SELECTOR}`).exists();
  });

  test('should show the title of area', function (assert) {
    // then
    assert.ok(find(TITLE_SELECTOR).textContent.includes(area.title));
  });

  test('should include one competences line per competence', function (assert) {
    // then
    assert.dom(COMPETENCE_SELECTOR).exists({ count: area.resultCompetences.length });
  });

  module('on a specific line of competence', function () {
    module('when competence level is -1', function () {
      test('should be grayed out (almost transparent) and not show the level', function (assert) {
        assert.strictEqual(
          find(`${COMPETENCE_SELECTOR}:nth-child(3) span`).textContent,
          area.resultCompetences[1].level.toString()
        );
        assert.ok(find(`${COMPETENCE_SELECTOR}:nth-child(3) p`).classList.toString().includes(DISABLED_CLASS));
      });
    });

    module('when competence level is 0', function () {
      test('should show "-" for the level (not 0)', function (assert) {
        assert.strictEqual(find(`${COMPETENCE_SELECTOR}:nth-child(4) span`).textContent, '-');
        assert.notOk(find(`${COMPETENCE_SELECTOR}:nth-child(4) p`).classList.toString().includes(DISABLED_CLASS));
      });
    });

    module('when competence level is greater or equal than 1', function () {
      test('should show the level', function (assert) {
        assert.strictEqual(find(`${COMPETENCE_SELECTOR}:nth-child(5) span`).textContent, '3');
        assert.notOk(find(`${COMPETENCE_SELECTOR}:nth-child(5) p`).classList.toString().includes(DISABLED_CLASS));
      });
    });
  });
});
