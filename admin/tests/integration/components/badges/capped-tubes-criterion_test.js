import { click } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Badges::CappedTubes', function (hooks) {
  setupRenderingTest(hooks);

  test('should display learning content accordeon with tubes and levels', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const cappedTubesDTO = [
      {
        tubeId: 'tube1Thematic1Competence1Area1ID',
        level: 3,
      },
      {
        tubeId: 'tube2Thematic1Competence1Area1ID',
        level: 1,
      },
      {
        tubeId: 'tube1Thematic2Competence1Area1ID',
        level: 5,
      },
      {
        tubeId: 'tube1Thematic1Competence2Area1ID',
        level: 4,
      },
      {
        tubeId: 'tube1Thematic1Competence1Area2ID',
        level: 7,
      },
    ];
    const tube1Thematic1Competence1Area1 = store.createRecord('tube', {
      id: 'tube1Thematic1Competence1Area1ID',
      name: 'tube1Thematic1Competence1Area1 name',
      practicalTitle: 'tube1Thematic1Competence1Area1 practicalTitle',
      level: 8,
    });
    const tube2Thematic1Competence1Area1 = store.createRecord('tube', {
      id: 'tube2Thematic1Competence1Area1ID',
      name: 'tube2Thematic1Competence1Area1 name',
      practicalTitle: 'tube2Thematic1Competence1Area1 practicalTitle',
      level: 8,
    });
    const tube3Thematic1Competence1Area1 = store.createRecord('tube', {
      id: 'tube3Thematic1Competence1Area1ID',
      name: 'tube3Thematic1Competence1Area1 name',
      practicalTitle: 'tube3Thematic1Competence1Area1 practicalTitle',
      level: 8,
    });
    const thematic1Competence1Area1 = store.createRecord('thematic', {
      id: 'thematic1Competence1Area1ID',
      name: 'thematic1Competence1Area1 name',
      index: 'thematic1Competence1Area1 index',
      tubes: [tube1Thematic1Competence1Area1, tube2Thematic1Competence1Area1, tube3Thematic1Competence1Area1],
    });
    const tube1Thematic2Competence1Area1 = store.createRecord('tube', {
      id: 'tube1Thematic2Competence1Area1ID',
      name: 'tube1Thematic2Competence1Area1 name',
      practicalTitle: 'tube1Thematic2Competence1Area1 practicalTitle',
      level: 8,
    });
    const thematic2Competence1Area1 = store.createRecord('thematic', {
      id: 'thematic2Competence1Area1ID',
      name: 'thematic2Competence1Area1 name',
      index: 'thematic2Competence1Area1 index',
      tubes: [tube1Thematic2Competence1Area1],
    });
    const tube1Thematic3Competence1Area1 = store.createRecord('tube', {
      id: 'tube1Thematic3Competence1Area1ID',
      name: 'tube1Thematic3Competence1Area1 name',
      practicalTitle: 'tube1Thematic3Competence1Area1 practicalTitle',
      level: 8,
    });
    const thematic3Competence1Area1 = store.createRecord('thematic', {
      id: 'thematic3Competence1Area1ID',
      name: 'thematic3Competence1Area1 name',
      index: 'thematic3Competence1Area1 index',
      tubes: [tube1Thematic3Competence1Area1],
    });
    const competence1Area1 = store.createRecord('competence', {
      id: 'competence1Area1ID',
      name: 'competence1Area1 name',
      index: 'competence1Area1 index',
      thematics: [thematic1Competence1Area1, thematic2Competence1Area1, thematic3Competence1Area1],
    });
    const tube1Thematic1Competence2Area1 = store.createRecord('tube', {
      id: 'tube1Thematic1Competence2Area1ID',
      name: 'tube1Thematic1Competence2Area1 name',
      practicalTitle: 'tube1Thematic1Competence2Area1 practicalTitle',
      level: 8,
    });
    const thematic1Competence2Area1 = store.createRecord('thematic', {
      id: 'thematic1Competence2Area1ID',
      name: 'thematic1Competence2Area1 name',
      index: 'thematic1Competence2Area1 index',
      tubes: [tube1Thematic1Competence2Area1],
    });
    const competence2Area1 = store.createRecord('competence', {
      id: 'competence2Area1ID',
      name: 'competence2Area1 name',
      index: 'competence2Area1 index',
      thematics: [thematic1Competence2Area1],
    });
    const tube1Thematic1Competence3Area1 = store.createRecord('tube', {
      id: 'tube1Thematic1Competence3Area1ID',
      name: 'tube1Thematic1Competence3Area1 name',
      practicalTitle: 'tube1Thematic1Competence3Area1 practicalTitle',
      level: 8,
    });
    const thematic1Competence3Area1 = store.createRecord('thematic', {
      id: 'thematic1Competence3Area1ID',
      name: 'thematic1Competence3Area1 name',
      index: 'thematic1Competence3Area1 index',
      tubes: [tube1Thematic1Competence3Area1],
    });
    const competence3Area1 = store.createRecord('competence', {
      id: 'competence3Area1ID',
      name: 'competence3Area1 name',
      index: 'competence3Area1 index',
      thematics: [thematic1Competence3Area1],
    });
    const area1 = store.createRecord('area', {
      id: 'area1ID',
      title: 'area1 title',
      code: 'area1 code',
      color: 'area1 color',
      frameworkId: 'frameworkId1',
      competences: [competence1Area1, competence2Area1, competence3Area1],
    });
    const tube1Thematic1Competence1Area2 = store.createRecord('tube', {
      id: 'tube1Thematic1Competence1Area2ID',
      name: 'tube1Thematic1Competence1Area2 name',
      practicalTitle: 'tube1Thematic1Competence1Area2 practicalTitle',
      level: 8,
    });
    const thematic1Competence1Area2 = store.createRecord('thematic', {
      id: 'thematic1Competence1Area2ID',
      name: 'thematic1Competence1Area2 name',
      index: 'thematic1Competence1Area2 index',
      tubes: [tube1Thematic1Competence1Area2],
    });
    const competence1Area2 = store.createRecord('competence', {
      id: 'competence1Area2ID',
      name: 'competence1Area2 name',
      index: 'competence1Area2 index',
      thematics: [thematic1Competence1Area2],
    });
    const area2 = store.createRecord('area', {
      id: 'area2ID',
      title: 'area2 title',
      code: 'area2 code',
      color: 'area2 color',
      frameworkId: 'frameworkId2',
      competences: [competence1Area2],
    });

    const targetProfile = store.createRecord('target-profile', {
      areas: [area1, area2],
    });
    const criterion = store.createRecord('badge-criterion', {
      scope: 'CappedTubes',
      threshold: 70,
      skillSets: [],
      cappedTubes: cappedTubesDTO,
    });
    this.set('criterion', criterion);
    this.set('targetProfile', targetProfile);

    // when
    const screen = await render(
      hbs`<Badges::CappedTubesCriterion @criterion={{this.criterion}} @targetProfile={{this.targetProfile}} />`
    );
    for (const button of screen.getAllByRole('button', { expanded: false })) {
      await click(button);
    }
    for (const button of screen.getAllByRole('button', { expanded: false })) {
      await click(button);
    }

    // then
    const tubeRows = document.querySelectorAll('[aria-label="Sujet"]');
    assert.deepEqual(
      screen.getByTestId('toujourstriste').innerText,
      "L'évalué doit obtenir 70% sur tous les sujets plafonnés par niveau suivants :"
    );
    assert.strictEqual(tubeRows.length, cappedTubesDTO.length);
    assert.strictEqual(
      tubeRows[0].cells[1].innerText,
      'tube1Thematic1Competence1Area1 name : tube1Thematic1Competence1Area1 practicalTitle'
    );
    assert.strictEqual(tubeRows[0].cells[2].innerText, '3');
    assert.strictEqual(
      tubeRows[1].cells[0].innerText,
      'tube2Thematic1Competence1Area1 name : tube2Thematic1Competence1Area1 practicalTitle'
    );
    assert.strictEqual(tubeRows[1].cells[1].innerText, '1');
    assert.strictEqual(
      tubeRows[2].cells[1].innerText,
      'tube1Thematic2Competence1Area1 name : tube1Thematic2Competence1Area1 practicalTitle'
    );
    assert.strictEqual(tubeRows[2].cells[2].innerText, '5');
    assert.strictEqual(
      tubeRows[3].cells[1].innerText,
      'tube1Thematic1Competence2Area1 name : tube1Thematic1Competence2Area1 practicalTitle'
    );
    assert.strictEqual(tubeRows[3].cells[2].innerText, '4');
    assert.strictEqual(
      tubeRows[4].cells[1].innerText,
      'tube1Thematic1Competence1Area2 name : tube1Thematic1Competence1Area2 practicalTitle'
    );
    assert.strictEqual(tubeRows[4].cells[2].innerText, '7');
  });
});
