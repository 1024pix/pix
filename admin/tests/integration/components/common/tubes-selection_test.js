import { module, test } from 'qunit';
import { render, clickByName } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import sinon from 'sinon';

module('Integration | Component | Common::TubesSelection', function (hooks) {
  setupRenderingTest(hooks);
  let screen;

  hooks.beforeEach(async function () {
    const tubes1 = [
      {
        id: 'tubeId1',
        name: '@tubeName1',
        practicalTitle: 'Tube 1',
        skills: [],
      },
      {
        id: 'tubeId2',
        name: '@tubeName2',
        practicalTitle: 'Tube 2',
        skills: [],
      },
    ];

    const tubes2 = [
      {
        id: 'tubeId3',
        name: '@tubeName3',
        practicalTitle: 'Tube 3',
        skills: [],
      },
    ];

    const thematics = [
      { id: 'thematicId1', name: 'Thématique 1', tubes: tubes1 },
      { id: 'thematicId2', name: 'Thématique 2', tubes: tubes2 },
    ];

    const competences = [
      {
        id: 'competenceId',
        index: '1',
        name: 'Titre competence',
        get sortedThematics() {
          return thematics;
        },
        thematics,
      },
    ];

    const areas = [
      {
        title: 'Titre domaine',
        code: 1,
        get sortedCompetences() {
          return competences;
        },
        competences,
      },
    ];

    const frameworks = [{ id: 'frameworkId', name: 'Pix', areas }];
    this.set('frameworks', frameworks);

    const onChangeFunction = sinon.stub();
    this.set('onChangeFunction', onChangeFunction);

    screen = await render(
      hbs`<Common::TubesSelection
          @frameworks={{this.frameworks}}
          @onChange={{this.onChangeFunction}}
          @displayJsonImportButton={{true}}
          @displayDeviceCompatibility={{true}}
          />`
    );
  });

  test('it should display a list of tubes', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');

    // then
    assert.dom(screen.getByText('@tubeName1 : Tube 1')).exists();
    assert.dom(screen.getByText('@tubeName2 : Tube 2')).exists();
    assert.dom(screen.getByText('@tubeName3 : Tube 3')).exists();
  });

  test('it should check the tubes if selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('@tubeName1 : Tube 1');

    // then
    assert.dom(screen.getByLabelText('@tubeName1 : Tube 1')).isChecked();
  });

  test('it should check all tubes corresponding to the thematics if a thematic is selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Thématique 1');

    // then
    assert.dom(screen.getByLabelText('@tubeName1 : Tube 1')).isChecked();
    assert.dom(screen.getByLabelText('@tubeName2 : Tube 2')).isChecked();
    assert.dom(screen.getByLabelText('Thématiques')).isNotChecked();
    assert.dom(screen.getByLabelText('Thématiques')).hasProperty('indeterminate', true);
  });

  test('it should check the thematic if all corresponding tubes are selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('@tubeName1 : Tube 1');
    await clickByName('@tubeName2 : Tube 2');

    // then
    assert.dom(screen.getByLabelText('Thématique 1')).isChecked();
    assert.dom(screen.getByLabelText('Thématiques')).isNotChecked();
    assert.dom(screen.getByLabelText('Thématiques')).hasProperty('indeterminate', true);
  });

  test('it should indeterminate the thematic if not all of corresponding tubes are selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('@tubeName1 : Tube 1');

    // then
    assert.dom(screen.getByLabelText('Thématique 1')).isNotChecked();
    assert.dom(screen.getByLabelText('Thématique 1')).hasProperty('indeterminate', true);
    assert.dom(screen.getByLabelText('Thématiques')).isNotChecked();
    assert.dom(screen.getByLabelText('Thématiques')).hasProperty('indeterminate', true);
  });

  test('it should check the competence if all corresponding thematics are selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Thématique 1');
    await clickByName('Thématique 2');

    // then
    assert.dom(screen.getByLabelText('Thématiques')).isChecked();
  });

  test('it should check the thematics and tubes if competence is selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Thématiques');

    // then
    assert.dom(screen.getByLabelText('Thématique 1')).isChecked();
    assert.dom(screen.getByLabelText('Thématique 1')).hasProperty('indeterminate', false);

    assert.dom(screen.getByLabelText('Thématique 2')).isChecked();
    assert.dom(screen.getByLabelText('Thématique 2')).hasProperty('indeterminate', false);

    assert.dom(screen.getByLabelText('@tubeName1 : Tube 1')).isChecked();
    assert.dom(screen.getByLabelText('@tubeName2 : Tube 2')).isChecked();
    assert.dom(screen.getByLabelText('@tubeName3 : Tube 3')).isChecked();
  });

  module('#import tubes preselection or target profile export', function () {
    test('it should display a button to import JSON file', function (assert) {
      // then
      assert.dom(screen.getByText('Importer un fichier JSON')).exists();
    });
  });

  test('it should show the total number of tubes and selected tubes', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('@tubeName1 : Tube 1');

    // then
    assert.dom(screen.getByText('1/3')).exists();
  });

  test('it should show compatibility column ', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');

    // then
    assert.dom(screen.getByText('Compatibilité')).exists();
  });
});
