import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import createComponent from '../../../helpers/create-glimmer-component';

const NO_SKILL = undefined;

module('Unit |  Component | Target Profiles | details', (hooks) => {
  setupTest(hooks);

  test('build empty competence list with no target profile', function(assert) {
    const component = createComponent('component:target-profiles/details');
    component.args = {
      targetProfile: {
        areas: [],
      },
    };

    assert.deepEqual(component.competenceList, []);
  });

  test('build competence list with a complete target profile', function(assert) {
    const component = createComponent('component:target-profiles/details');
    component.args = {
      targetProfile: {
        areas: [
          { id: 'area1', title: 'Area 1' },
          { id: 'area2', title: 'Area 2' },
        ],
        competences: [
          { id: 'competence2', name: 'Competence 2', areaId: 'area2', index: '1.2' },
          { id: 'competence1', name: 'Competence 1', areaId: 'area1', index: '1.1' },
        ],
        tubes: [
          { id: 'tube1', practicalTitle: 'Tube 1', competenceId: 'competence1' },
          { id: 'tube2', practicalTitle: 'Tube 2', competenceId: 'competence2' },
          { id: 'tube3', practicalTitle: 'Tube 3', competenceId: 'competence2' },
        ],
        skills: [
          { id: 'skill1', name: '@Skill 1', difficulty: 1, tubeId: 'tube1' },
          { id: 'skill2', name: '@Skill 2', difficulty: 2, tubeId: 'tube1' },
          { id: 'skill3', name: '@Skill 3', difficulty: 3, tubeId: 'tube2' },
          { id: 'skill4', name: '@Skill 4', difficulty: 3, tubeId: 'tube3' },
        ],
      },
    };

    assert.deepEqual(component.competenceList, [
      {
        name: 'Competence 1',
        index: '1.1',
        area: { id: 'area1', title: 'Area 1' },
        tubes: [{
          practicalTitle: 'Tube 1',
          skills: [
            { id: 'skill1', name: '@Skill 1', difficulty: 1, tubeId: 'tube1' },
            { id: 'skill2', name: '@Skill 2', difficulty: 2, tubeId: 'tube1' },
            NO_SKILL, NO_SKILL, NO_SKILL, NO_SKILL, NO_SKILL, NO_SKILL,
          ],
        }],
      },
      {
        name: 'Competence 2',
        index: '1.2',
        area: { id: 'area2', title: 'Area 2' },
        tubes: [{
          practicalTitle: 'Tube 2',
          skills: [
            NO_SKILL, NO_SKILL,
            { id: 'skill3', name: '@Skill 3', difficulty: 3, tubeId: 'tube2' },
            NO_SKILL, NO_SKILL, NO_SKILL, NO_SKILL, NO_SKILL,
          ],
        }, {
          practicalTitle: 'Tube 3',
          skills: [
            NO_SKILL, NO_SKILL,
            { id: 'skill4', name: '@Skill 4', difficulty: 3, tubeId: 'tube3' },
            NO_SKILL, NO_SKILL, NO_SKILL, NO_SKILL, NO_SKILL,
          ],
        }],
      },
    ]);
  });
});
