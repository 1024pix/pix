import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import { clickByName } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';

module('Integration | Component | targetProfiles::NewTubeBased::TubesSelection', function (hooks) {
  setupRenderingTest(hooks);
  let selectedFrameworks;

  hooks.beforeEach(() => {
    const tubes1 = [
      {
        id: 'tubeId1',
        practicalTitle: 'Tube 1',
        practicalDescription: 'Description 1',
      },
      {
        id: 'tubeId2',
        practicalTitle: 'Tube 2',
        practicalDescription: 'Description 2',
      },
    ];

    const tubes2 = [
      {
        id: 'tubeId3',
        practicalTitle: 'Tube 3',
        practicalDescription: 'Description 3',
      },
    ];

    const thematics = [
      { id: 'thematicId1', name: 'thematic1', tubes: tubes1 },
      { id: 'thematicId2', name: 'thematic2', tubes: tubes2 },
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
      },
    ];
    selectedFrameworks = [{ areas }];
  });

  test('it should display a list of tubes', async function (assert) {
    // given
    this.set('selectedFrameworks', selectedFrameworks);

    // when
    await render(hbs`<TargetProfiles::NewTubeBased::TubesSelection @selectedFrameworks={{this.selectedFrameworks}}/>`);

    // then
    assert.dom('.row-tube').exists({ count: 3 });
    assert.dom('[data-test=label-tube-tubeId1]').hasText('Tube 1 : Description 1');
    assert.dom('[data-test=label-tube-tubeId2]').hasText('Tube 2 : Description 2');
    assert.dom('[data-test=label-tube-tubeId3]').hasText('Tube 3 : Description 3');
  });

  test('it should check the tubes if selected', async function (assert) {
    // given
    this.set('selectedFrameworks', selectedFrameworks);

    // when
    await render(hbs`<TargetProfiles::NewTubeBased::TubesSelection @selectedFrameworks={{this.selectedFrameworks}}/>`);
    const tube1 = document.getElementById('tube-tubeId1');

    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Tube 1 : Description 1');

    // then
    assert.dom(tube1).isChecked();
  });

  test('Should check all tubes corresponding to the thematics if a thematic is selected', async function (assert) {
    // given
    this.set('selectedFrameworks', selectedFrameworks);

    // when
    await render(hbs`<TargetProfiles::NewTubeBased::TubesSelection @selectedFrameworks={{this.selectedFrameworks}}/>`);
    const tube1 = document.getElementById('tube-tubeId1');
    const tube2 = document.getElementById('tube-tubeId2');
    const competence = document.getElementById('competence-competenceId');
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('thematic1');

    // then
    assert.dom(tube1).isChecked();
    assert.dom(tube2).isChecked();
    assert.true(competence.indeterminate);
  });

  test('Should check the thematic if all corresponding tubes are selected', async function (assert) {
    // given
    this.set('selectedFrameworks', selectedFrameworks);

    // when
    await render(hbs`<TargetProfiles::NewTubeBased::TubesSelection @selectedFrameworks={{this.selectedFrameworks}}/>`);
    const thematic = document.getElementById('thematic-thematicId1');
    const competence = document.getElementById('competence-competenceId');
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Tube 1 : Description 1');
    await clickByName('Tube 2 : Description 2');

    // then
    assert.dom(thematic).isChecked();
    assert.true(competence.indeterminate);
  });

  test('Should indeterminate the thematic if not all of corresponding tubes are selected', async function (assert) {
    // given
    this.set('selectedFrameworks', selectedFrameworks);

    // when
    await render(hbs`<TargetProfiles::NewTubeBased::TubesSelection @selectedFrameworks={{this.selectedFrameworks}}/>`);
    const thematic = document.getElementById('thematic-thematicId1');
    const competence = document.getElementById('competence-competenceId');
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Tube 1 : Description 1');

    // then
    assert.true(thematic.indeterminate);
    assert.true(competence.indeterminate);
  });

  test('Should check the competence if all corresponding thematics are selected', async function (assert) {
    // given
    this.set('selectedFrameworks', selectedFrameworks);

    // when
    await render(hbs`<TargetProfiles::NewTubeBased::TubesSelection @selectedFrameworks={{this.selectedFrameworks}}/>`);
    const competence = document.getElementById('competence-competenceId');
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('thematic1');
    await clickByName('thematic2');

    // then
    assert.dom(competence).isChecked();
  });

  test('Should check the thematics and tubes if competence is selected', async function (assert) {
    // given
    this.set('selectedFrameworks', selectedFrameworks);

    // when
    await render(hbs`<TargetProfiles::NewTubeBased::TubesSelection @selectedFrameworks={{this.selectedFrameworks}}/>`);
    const thematic1 = document.getElementById('thematic-thematicId1');
    const thematic2 = document.getElementById('thematic-thematicId2');
    const tube1 = document.getElementById('tube-tubeId1');
    const tube2 = document.getElementById('tube-tubeId2');
    const tube3 = document.getElementById('tube-tubeId3');
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Thématiques');

    // then
    assert.dom(thematic1).isChecked();
    assert.false(thematic1.indeterminate);

    assert.dom(thematic2).isChecked();
    assert.false(thematic2.indeterminate);

    assert.dom(tube1).isChecked();
    assert.dom(tube2).isChecked();
    assert.dom(tube3).isChecked();
  });
});
