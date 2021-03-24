import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/target-profiles/target-profile | details', (hooks) => {

  setupRenderingTest(hooks);

  test('it should display target profile with areas and competences', async function(assert) {
    // given
    this.targetProfile = { areas: [] };

    // when
    await render(hbs`<TargetProfiles::Details @targetProfile={{this.targetProfile}}/>`);

    // then
    assert.contains('Profil cible vide.');
  });

  test('it should display competences of areas', async function(assert) {
    // given
    const area1 = { id: 'area1', title: 'Area 1' };
    const competence1 = { id: 'competence1', name: 'Competence 1', areaId: 'area1' };
    const tube1 = { id: 'tube1', practicalTitle: 'Tube 1', competenceId: 'competence1' };
    const skill1 = { id: 'skill1', name: '@Skill 1', difficulty: 1, tubeId: 'tube1' };

    const area2 = { id: 'area2', title: 'Area 2' };
    const competence2 = { id: 'competence2', name: 'Competence 2', areaId: 'area2' };
    const tube2 = { id: 'tube2', practicalTitle: 'Tube 2', competenceId: 'competence2' };
    const skill2 = { id: 'skill2', name: 'Skill 2', difficulty: 1, tubeId: 'tube2' };

    this.targetProfile = {
      areas: [area1, area2],
      competences: [competence1, competence2],
      tubes: [tube1, tube2],
      skills: [skill1, skill2],
    };

    // when
    await render(hbs`<TargetProfiles::Details @targetProfile={{this.targetProfile}} />`);

    // then
    assert.contains('Competence 1');
    assert.contains('Competence 2');
  });

  test('it should display tubes of competences', async function(assert) {
    // given
    const area1 = { id: 'area1', title: 'Area 1' };
    const competence1 = { id: 'competence1', name: 'Competence 1', areaId: 'area1' };
    const tube1 = { id: 'tube1', practicalTitle: 'Tube 1', competenceId: 'competence1' };
    const skill1 = { id: 'skill1', name: '@Skill 1', difficulty: 1, tubeId: 'tube1' };
    const tube2 = { id: 'tube2', practicalTitle: 'Tube 2', competenceId: 'competence1' };
    const skill2 = { id: 'skill2', name: '@Skill 2', difficulty: 1, tubeId: 'tube2' };

    this.targetProfile = {
      areas: [area1],
      competences: [competence1],
      tubes: [tube1, tube2],
      skills: [skill1, skill2],
    };

    // when
    await render(hbs`<TargetProfiles::Details @targetProfile={{this.targetProfile}} />`);

    // then
    assert.contains('Area 1');
    assert.contains('Tube 1');
    assert.contains('Tube 2');
  });

  test('it should display skills of tubes', async function(assert) {
    // given
    const area1 = { id: 'area1', title: 'Area 1' };
    const competence1 = { id: 'competence1', name: 'Competence 1', areaId: 'area1' };
    const tube1 = { id: 'tube1', practicalTitle: 'Tube 1', competenceId: 'competence1' };
    const skill1 = { id: 'skill1', name: '@Skill 1', difficulty: 1, tubeId: 'tube1' };
    const skill2 = { id: 'skill2', name: '@Skill 2', difficulty: 2, tubeId: 'tube1' };

    this.targetProfile = {
      areas: [area1],
      competences: [competence1],
      tubes: [tube1],
      skills: [skill1, skill2],
    };

    // when
    await render(hbs`<TargetProfiles::Details @targetProfile={{this.targetProfile}} />`);

    // then
    assert.dom('[data-icon="check"]').exists({ count: 2 });
    assert.dom('[data-icon="times"]').exists({ count: 6 });
  });
});
