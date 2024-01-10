import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import { render } from '@1024pix/ember-testing-library';
import { A as EmberArray } from '@ember/array';
import { getTableData } from '../../helpers/get-table-data';

module('Integration | Component | user-certifications-detail-competence', function (hooks) {
  setupIntlRenderingTest(hooks);

  let area;
  let screen;
  const PARENT_SELECTOR = '.user-certifications-detail-competence';

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
    screen = await render(hbs`<UserCertificationsDetailCompetence @area={{this.area}} />`);
  });

  test('renders', function (assert) {
    //then
    assert.dom(`${PARENT_SELECTOR}`).exists();
  });

  test('should show the title of area', async function (assert) {
    // then
    const title = await screen.getByRole('columnheader', {
      name: area.title,
    });
    assert.dom(title).exists();
  });

  test('render all the competences properly', async function (assert) {
    // then
    const table = await screen.getByRole('table');

    const tableData = await getTableData(table);
    assert.deepEqual(tableData, [
      {
        'CRÉATION DE CONTENU': 'Programmer',
        NIVEAU: '5',
      },
      {
        'CRÉATION DE CONTENU': 'Adapter les docs à leur finalité',
        NIVEAU: '',
      },
      {
        'CRÉATION DE CONTENU': 'Développer des docs multimédia',
        NIVEAU: '',
      },
      {
        'CRÉATION DE CONTENU': 'Développer des docs textuels',
        NIVEAU: '3',
      },
    ]);
  });
});
