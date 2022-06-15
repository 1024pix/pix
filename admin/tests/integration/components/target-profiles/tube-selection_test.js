import { module, test } from 'qunit';
import { render, clickByName, within } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import sinon from 'sinon';

module('Integration | Component | targetProfiles::TubesSelection', function (hooks) {
  setupRenderingTest(hooks);
  let screen;

  hooks.beforeEach(async function () {
    const tubes1 = [
      {
        id: 'tubeId1',
        practicalTitle: 'Tube 1',
        practicalDescription: 'Description 1',
        skills: [],
      },
      {
        id: 'tubeId2',
        practicalTitle: 'Tube 2',
        practicalDescription: 'Description 2',
        skills: [],
      },
    ];

    const tubes2 = [
      {
        id: 'tubeId3',
        practicalTitle: 'Tube 3',
        practicalDescription: 'Description 3',
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
    this.set('areas', areas);

    const frameworks = [{ id: 'frameworkId', name: 'Pix', areas }];
    this.set('frameworks', frameworks);

    const refreshAreas = sinon.stub();
    this.set('refreshAreas', refreshAreas);

    this.set('selectedTubeIds', []);

    screen = await render(
      hbs`<TargetProfiles::TubesSelection @frameworks={{this.frameworks}} @areas={{this.areas}} @selectedTubeIds={{this.selectedTubeIds}} @refreshAreas={{this.refreshAreas}} />`
    );
  });

  test('it should display a list of tubes', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');

    // then
    assert.dom(screen.getByText('Tube 1 : Description 1')).exists();
    assert.dom(screen.getByText('Tube 2 : Description 2')).exists();
    assert.dom(screen.getByText('Tube 3 : Description 3')).exists();
  });

  test('it should check the tubes if selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Tube 1 : Description 1');

    // then
    assert.dom(screen.getByLabelText('Tube 1 : Description 1')).isChecked();
  });

  test('it should check all tubes corresponding to the thematics if a thematic is selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Thématique 1');

    // then
    assert.dom(screen.getByLabelText('Tube 1 : Description 1')).isChecked();
    assert.dom(screen.getByLabelText('Tube 2 : Description 2')).isChecked();
    assert.dom(screen.getByLabelText('Thématiques')).isNotChecked();
    assert.dom(screen.getByLabelText('Thématiques')).hasProperty('indeterminate', true);
  });

  test('it should check the thematic if all corresponding tubes are selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Tube 1 : Description 1');
    await clickByName('Tube 2 : Description 2');

    // then
    assert.dom(screen.getByLabelText('Thématique 1')).isChecked();
    assert.dom(screen.getByLabelText('Thématiques')).isNotChecked();
    assert.dom(screen.getByLabelText('Thématiques')).hasProperty('indeterminate', true);
  });

  test('it should indeterminate the thematic if not all of corresponding tubes are selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Tube 1 : Description 1');

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

    assert.dom(screen.getByLabelText('Tube 1 : Description 1')).isChecked();
    assert.dom(screen.getByLabelText('Tube 2 : Description 2')).isChecked();
    assert.dom(screen.getByLabelText('Tube 3 : Description 3')).isChecked();
  });

  // TO MOVE IN NEW_TEST
  // module('when no tubes are selected', function () {
  //   test('it should display a disabled download subjects selection button', async function (assert) {
  //     // then
  //     assert.dom(screen.getByRole('button', { name: 'Télécharger la sélection des sujets (JSON)' })).isDisabled();
  //   });
  // });

  // module('when at least one tube is selected', function () {
  //   test('it should display a download subjects selection button that is not disabled', async function (assert) {
  //     // when
  //     await clickByName('1 · Titre domaine');
  //     await clickByName('1 Titre competence');
  //     await clickByName('Tube 1 : Description 1');

  //     // then
  //     assert.dom(screen.getByRole('button', { name: 'Télécharger la sélection des sujets (JSON)' })).isNotDisabled();
  //   });
  // });
});
